"""Deforestation detection routes

POST /deforestation/run - Run GEE analysis and return results with uploaded URLs
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.deps import get_database

router = APIRouter(prefix="/deforestation", tags=["deforestation"])


class DeforestationRunRequest(BaseModel):
    """Request payload for running deforestation analysis"""
    project_id: str
    start_date: str  # YYYY-MM-DD
    end_date: str  # YYYY-MM-DD
    project_boundary: Dict[str, Any]  # GeoJSON Feature or Geometry
    parameters: Optional[Dict[str, Any]] = None


class DeforestationRunResponse(BaseModel):
    """Response with analysis results and URLs"""
    project_id: str
    run_id: str
    start_date: str
    end_date: str
    stats: Dict[str, Any]
    quality: Dict[str, Any]
    outputs: Dict[str, str]  # URLs to uploaded files
    metadata: Dict[str, Any]


@router.post("/run", response_model=DeforestationRunResponse)
def run_deforestation_analysis(
    request: DeforestationRunRequest,
    db=Depends(get_database)
):
    """
    [GEE PIPELINE] Run deforestation detection analysis using Google Earth Engine.
    
    Workflow:
    1. Runs NDVI change detection on Sentinel-2 imagery
    2. Exports before/after RGB, delta NDVI, and loss polygons
    3. Uploads all files to Supabase Storage
    4. Returns stats and public URLs
    
    Request:
    - project_id: Project identifier
    - start_date/end_date: Analysis period (YYYY-MM-DD)
    - project_boundary: GeoJSON polygon of area to analyze
    - parameters: Optional thresholds and settings
    
    Returns:
    - stats: affected_area_ha, mean_ndvi_before, mean_ndvi_after
    - quality: observations_used, avg_cloud_cover_pct
    - outputs: Public URLs to before_rgb, after_rgb, delta_ndvi, loss_polygons
    - metadata: Processing details and parameters
    
    Example payload:
    {
      "project_id": "demo-1",
      "start_date": "2026-01-01",
      "end_date": "2026-01-28",
      "project_boundary": {
        "type": "Polygon",
        "coordinates": [[[9.18,45.46],[9.18,45.47],[9.20,45.47],[9.20,45.46],[9.18,45.46]]]
      },
      "parameters": {
        "cloud_filter_max_pct": 30,
        "ndvi_loss_threshold": -0.2,
        "min_initial_ndvi": 0.6,
        "scale": 10
      }
    }
    """
    try:
        # Lazy import GEE services (only loaded when endpoint is called)
        from app.services.gee_export_service import run_geemap_export
        from app.services.storage_service import upload_file
        
        # Run GEE export
        result = run_geemap_export(
            project_id=request.project_id,
            start_date=request.start_date,
            end_date=request.end_date,
            project_boundary=request.project_boundary,
            parameters=request.parameters
        )
        
        # Upload files to Supabase Storage
        run_id = result["run_id"]
        project_id = result["project_id"]
        
        uploaded_urls = {}
        
        # Upload before RGB
        if result["outputs_local"].get("before_rgb"):
            storage_path = f"{project_id}/{run_id}/before_rgb.tif"
            uploaded_urls["before_rgb_tif_url"] = upload_file(
                result["outputs_local"]["before_rgb"],
                storage_path,
                "image/tiff"
            )
        
        # Upload after RGB
        if result["outputs_local"].get("after_rgb"):
            storage_path = f"{project_id}/{run_id}/after_rgb.tif"
            uploaded_urls["after_rgb_tif_url"] = upload_file(
                result["outputs_local"]["after_rgb"],
                storage_path,
                "image/tiff"
            )
        
        # Upload delta NDVI
        if result["outputs_local"].get("delta_ndvi"):
            storage_path = f"{project_id}/{run_id}/delta_ndvi.tif"
            uploaded_urls["delta_ndvi_tif_url"] = upload_file(
                result["outputs_local"]["delta_ndvi"],
                storage_path,
                "image/tiff"
            )
        
        # Upload loss polygons
        if result["outputs_local"].get("loss_polygons"):
            storage_path = f"{project_id}/{run_id}/loss_polygons.geojson"
            uploaded_urls["loss_polygons_geojson_url"] = upload_file(
                result["outputs_local"]["loss_polygons"],
                storage_path,
                "application/geo+json"
            )
        
        # Return response
        return DeforestationRunResponse(
            project_id=result["project_id"],
            run_id=result["run_id"],
            start_date=result["start_date"],
            end_date=result["end_date"],
            stats=result["stats"],
            quality=result["quality"],
            outputs=uploaded_urls,
            metadata=result["metadata"]
        )
        
    except ValueError as e:
        # Handle "No images found" errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Handle Earth Engine or other errors
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get("")
def deforestation(project_id: str | None = None):
    """Legacy endpoint - kept for backwards compatibility"""
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    return {
        "project_id": project_id,
        "run": {
            "run_id": "demo-run-2026-01",
            "start_date": "2026-01-01",
            "end_date": "2026-01-28",
            "algorithm": "ndvi_diff",
            "status": "done"
        },
        "stats": {"area_ha": 12.4, "polygon_count": 2},
        "outputs": {
            "before_rgb": None,
            "after_rgb": None,
            "delta_ndvi_png": None,
            "report_pdf": None,
            "polygons_geojson": None
        },
        "polygons": [
            {
                "id": "poly-1",
                "area_ha": 7.1,
                "confidence": "high",
                "geometry": {"type": "Polygon", "coordinates": [[[0,0],[0,1],[1,1],[0,0]]]}
            }
        ]
    }
