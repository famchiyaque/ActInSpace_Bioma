"""Run API routes

These endpoints handle deforestation analysis runs.

Endpoint Usage:
- GET /runs/{id} - [FRONTEND] Check run status and get results
- GET /runs/{id}/reports - [FRONTEND] Get generated reports/images
- POST /runs/{id}/gee-result - [GEE PIPELINE] Submit analysis results

Data Flow:
1. Frontend creates run via POST /projects/{id}/runs (status='queued')
2. GEE pipeline processes queued runs
3. GEE pipeline posts results to POST /runs/{id}/gee-result
4. Backend updates run status to 'completed' and creates reports
5. Frontend fetches updated data via GET /runs/{id}
"""

from fastapi import APIRouter, Depends, HTTPException
from app.services.runs_service import (
    get_run_detail,
    get_run_reports,
    process_gee_result
)
from app.schemas.runs import (
    RunDetail,
    ReportsResponse,
    GEEResultInput,
    GEEResultResponse
)
from app.deps import get_database

router = APIRouter(prefix="/runs", tags=["runs"])


@router.get("/{run_id}", response_model=RunDetail)
def get_run(run_id: str, db=Depends(get_database)):
    """
    [FRONTEND] Get complete run details.
    
    Returns:
    - All run fields: dates, method, status, parameters
    - Stats: analysis results from GEE (affected area, NDVI values, etc.)
    - hectares_change: Total deforestation detected
    - finished_at: When GEE completed processing
    
    Frontend Usage:
    - Poll this endpoint to check if run is completed
    - Display analysis statistics
    - Show processing status to user
    - Calculate carbon footprint from hectares_change
    
    Status values:
    - 'queued': Waiting for GEE processing
    - 'processing': GEE is analyzing (optional)
    - 'completed': Results available
    - 'failed': Processing error (optional)
    """
    return get_run_detail(run_id)


@router.get("/{run_id}/reports", response_model=ReportsResponse)
def get_reports(run_id: str, db=Depends(get_database)):
    """
    [FRONTEND] Get all generated reports/images for a run.
    
    Returns list of reports with:
    - report_type: 'before_image', 'after_image', 'delta_map', 'loss_polygons_geojson'
    - public_url: Direct link to file (image/geojson)
    - metadata: Satellite info, processing date, etc.
    
    Frontend Usage:
    - Display before/after satellite images
    - Show delta map (change visualization)
    - Load loss polygons GeoJSON for map overlay
    - Link to download reports
    
    Report Types:
    - before_image: RGB satellite image before period
    - after_image: RGB satellite image after period
    - delta_map: Visualization of changes (NDVI delta)
    - loss_polygons_geojson: Vector boundaries of detected deforestation
    """
    return get_run_reports(run_id)


@router.post("/{run_id}/gee-result", response_model=GEEResultResponse)
def submit_gee_result(
    run_id: str,
    gee_data: GEEResultInput,
    db=Depends(get_database)
):
    """
    [GEE PIPELINE] Submit processing results after analysis completes.
    
    GEE Pipeline sends:
    - stats: Analysis metrics (affected_area_ha, mean_ndvi_before/after, etc.)
    - outputs: URLs to generated images (before_image_url, after_image_url, delta_map_url)
    - loss_polygons_url: URL to GeoJSON file with deforestation polygons
    - metadata: Satellite info, processing platform, date
    
    Backend Actions:
    1. Updates run status to 'completed'
    2. Stores stats and hectares_change
    3. Calculates and updates project risk_label based on affected area:
       - affected_area_ha >= 10: 'high'
       - >= 3 and < 10: 'medium'
       - < 3: 'low'
    4. Creates report entries for each output URL
    5. Sets finished_at timestamp
    
    GEE Payload Example:
    {
      "project_id": "uuid",
      "run_id": "uuid",
      "start_date": "2026-01-01",
      "end_date": "2026-01-28",
      "stats": {
        "affected_area_ha": 12.4,
        "mean_ndvi_before": 0.72,
        "mean_ndvi_after": 0.41,
        "observations_used": 6,
        "avg_cloud_cover_pct": 8.3
      },
      "outputs": {
        "before_image_url": "https://storage.../before.png",
        "after_image_url": "https://storage.../after.png",
        "delta_map_url": "https://storage.../delta.png"
      },
      "loss_polygons_url": "https://storage.../polygons.geojson",
      "metadata": {
        "satellite": "Sentinel-2",
        "processing_platform": "Google Earth Engine",
        "processing_date": "2026-01-30"
      }
    }
    """
    # Validate run_id matches
    if gee_data.run_id != run_id:
        raise HTTPException(
            status_code=400,
            detail="run_id in URL does not match run_id in body"
        )
    
    return process_gee_result(gee_data)
