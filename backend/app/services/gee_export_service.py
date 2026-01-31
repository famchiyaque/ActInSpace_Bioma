"""Google Earth Engine export service for deforestation detection

Handles satellite imagery analysis using Google Earth Engine and geemap.

Workflow:
1. Initialize Earth Engine
2. Load Sentinel-2 imagery for specified boundary and date range
3. Calculate NDVI (Normalized Difference Vegetation Index)
4. Compare before/after periods to detect changes
5. Export RGB images, NDVI delta, and loss polygons
6. Return statistics and local file paths

Key Metrics:
- affected_area_ha: Total deforestation area in hectares
- mean_ndvi_before/after: Average vegetation health
- observations_used: Number of satellite images processed
"""

import os
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

try:
    import ee
    import geemap
    GEE_AVAILABLE = True
except ImportError:
    GEE_AVAILABLE = False
    print("Warning: Earth Engine dependencies not available. Install with: pip install earthengine-api geemap rasterio matplotlib")

from app.config import settings

# Initialize Earth Engine with project ID (once per module, but only if available)
if GEE_AVAILABLE:
    try:
        ee.Initialize(project=settings.gee_project_id)
    except Exception as e:
        print(f"Earth Engine initialization error: {e}")
        print(f"Make sure GEE_PROJECT_ID is set in .env and you've run: earthengine authenticate")


def run_geemap_export(
    project_id: str,
    start_date: str,
    end_date: str,
    project_boundary: Dict[str, Any],
    parameters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Run deforestation detection analysis using Google Earth Engine.
    
    Args:
        project_id: Project identifier
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        project_boundary: GeoJSON Feature or Geometry with project boundary
        parameters: Analysis parameters:
            - cloud_filter_max_pct: Max cloud cover % (default: 30)
            - ndvi_loss_threshold: NDVI decrease threshold (default: -0.2)
            - min_initial_ndvi: Minimum initial NDVI for forest (default: 0.6)
            - scale: Export resolution in meters (default: 10)
    
    Returns:
        Dict with:
        - project_id, run_id, start_date, end_date
        - stats: affected_area_ha, mean_ndvi_before, mean_ndvi_after, etc.
        - quality: observations_used, avg_cloud_cover_pct
        - outputs_local: paths to exported files
        - metadata: satellite info, processing details
    """
    # Generate run ID
    run_id = str(uuid.uuid4())
    
    # Parse parameters
    params = parameters or {}
    cloud_max = params.get("cloud_filter_max_pct", 30)
    ndvi_loss_threshold = params.get("ndvi_loss_threshold", -0.2)
    min_initial_ndvi = params.get("min_initial_ndvi", 0.6)
    scale = params.get("scale", 10)
    
    # Setup export directory
    export_dir = os.path.join("tmp_exports", project_id, run_id)
    os.makedirs(export_dir, exist_ok=True)
    
    # Parse boundary geometry
    if "geometry" in project_boundary:
        geom = project_boundary["geometry"]
    else:
        geom = project_boundary
    
    roi = ee.Geometry(geom)
    
    # Convert dates
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    
    # Split into before/after periods
    total_days = (end_dt - start_dt).days
    mid_dt = start_dt + timedelta(days=total_days // 2)
    
    before_start = start_date
    before_end = mid_dt.strftime("%Y-%m-%d")
    after_start = (mid_dt + timedelta(days=1)).strftime("%Y-%m-%d")
    after_end = end_date
    
    # Cloud masking function for Sentinel-2
    def mask_s2_clouds(image):
        scl = image.select('SCL')
        # SCL values: 3=cloud shadows, 8=cloud medium prob, 9=cloud high prob, 10=thin cirrus
        mask = scl.neq(3).And(scl.neq(8)).And(scl.neq(9)).And(scl.neq(10))
        return image.updateMask(mask)
    
    # Load Sentinel-2 collection
    s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
    
    # Before period
    before_col = (s2
                  .filterBounds(roi)
                  .filterDate(before_start, before_end)
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_max))
                  .map(mask_s2_clouds))
    
    before_count = before_col.size().getInfo()
    if before_count == 0:
        raise ValueError(f"No images found for before period ({before_start} to {before_end}). Try increasing cloud_filter_max_pct or date range.")
    
    before_median = before_col.median()
    before_ndvi = before_median.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # After period
    after_col = (s2
                 .filterBounds(roi)
                 .filterDate(after_start, after_end)
                 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloud_max))
                 .map(mask_s2_clouds))
    
    after_count = after_col.size().getInfo()
    if after_count == 0:
        raise ValueError(f"No images found for after period ({after_start} to {after_end}). Try increasing cloud_filter_max_pct or date range.")
    
    after_median = after_col.median()
    after_ndvi = after_median.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # Calculate delta NDVI
    delta_ndvi = after_ndvi.subtract(before_ndvi).rename('NDVI_delta')
    
    # Detect loss: before NDVI > threshold AND delta < loss threshold
    loss_mask = (before_ndvi.gt(min_initial_ndvi)
                 .And(delta_ndvi.lt(ndvi_loss_threshold)))
    
    # Calculate statistics
    stats_region = roi
    
    # Area calculation (in square meters, convert to hectares)
    loss_area_m2 = loss_mask.multiply(ee.Image.pixelArea()).reduceRegion(
        reducer=ee.Reducer.sum(),
        geometry=stats_region,
        scale=scale,
        maxPixels=1e9
    ).get('NDVI').getInfo() or 0
    
    affected_area_ha = loss_area_m2 / 10000  # m² to hectares
    
    # Mean NDVI values
    mean_ndvi_before = before_ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=stats_region,
        scale=scale,
        maxPixels=1e9
    ).get('NDVI').getInfo() or 0
    
    mean_ndvi_after = after_ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=stats_region,
        scale=scale,
        maxPixels=1e9
    ).get('NDVI').getInfo() or 0
    
    # Cloud cover average
    avg_cloud_pct = ((before_col.aggregate_mean('CLOUDY_PIXEL_PERCENTAGE').getInfo() or 0) +
                     (after_col.aggregate_mean('CLOUDY_PIXEL_PERCENTAGE').getInfo() or 0)) / 2
    
    # Export RGB images
    rgb_bands = ['B4', 'B3', 'B2']
    
    before_rgb_path = os.path.join(export_dir, "before_rgb.tif")
    geemap.ee_export_image(
        before_median.select(rgb_bands),
        filename=before_rgb_path,
        scale=scale,
        region=roi,
        file_per_band=False
    )
    
    after_rgb_path = os.path.join(export_dir, "after_rgb.tif")
    geemap.ee_export_image(
        after_median.select(rgb_bands),
        filename=after_rgb_path,
        scale=scale,
        region=roi,
        file_per_band=False
    )
    
    # Export delta NDVI
    delta_ndvi_path = os.path.join(export_dir, "delta_ndvi.tif")
    geemap.ee_export_image(
        delta_ndvi,
        filename=delta_ndvi_path,
        scale=scale,
        region=roi,
        file_per_band=False
    )
    
    # Vectorize loss polygons
    loss_vectors = loss_mask.selfMask().reduceToVectors(
        geometry=roi,
        scale=scale,
        maxPixels=1e9,
        geometryType='polygon'
    )
    
    # Export loss polygons as GeoJSON
    loss_polygons_path = os.path.join(export_dir, "loss_polygons.geojson")
    geemap.ee_export_vector(
        loss_vectors,
        filename=loss_polygons_path
    )
    
    # Return results
    return {
        "project_id": project_id,
        "run_id": run_id,
        "start_date": start_date,
        "end_date": end_date,
        "stats": {
            "affected_area_ha": round(affected_area_ha, 2),
            "mean_ndvi_before": round(mean_ndvi_before, 3),
            "mean_ndvi_after": round(mean_ndvi_after, 3),
        },
        "quality": {
            "observations_used": before_count + after_count,
            "avg_cloud_cover_pct": round(avg_cloud_pct, 1),
        },
        "outputs_local": {
            "before_rgb": before_rgb_path,
            "after_rgb": after_rgb_path,
            "delta_ndvi": delta_ndvi_path,
            "loss_polygons": loss_polygons_path,
        },
        "metadata": {
            "satellite": "Sentinel-2",
            "processing_platform": "Google Earth Engine",
            "processing_date": datetime.utcnow().isoformat(),
            "before_period": f"{before_start} to {before_end}",
            "after_period": f"{after_start} to {after_end}",
            "parameters": params,
        }
    }
