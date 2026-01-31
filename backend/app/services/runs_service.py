# Run service - business logic for run management

"""
Run Service Layer

Handles all business logic for deforestation analysis runs.

Key Functions:
- create_run(): Creates new analysis run (triggered by frontend)
- get_run_detail(): Fetches run status and results (polled by frontend)
- get_run_reports(): Gets generated images/maps (displayed by frontend)
- process_gee_result(): Processes results from GEE pipeline

Workflow:
1. Frontend creates run -> status='queued'
2. GEE picks up queued runs
3. GEE processes satellite data
4. GEE posts results -> status='completed'
5. Frontend displays results
"""

import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException
from app.db.queries import RunQueries, ReportQueries, ProjectQueries, GeomarkerQueries
from app.schemas.runs import (
    RunCreate,
    RunCreateResponse,
    RunDetail,
    ReportBase,
    ReportsResponse,
    GEEResultInput,
    GEEResultResponse,
    DeforestationResponse,
    DeforestationStats,
    OutputLinks,
    DeforestationPolygon,
)


def create_run(project_id: str, run_data: RunCreate) -> RunCreateResponse:
    """Create a new run for a project"""
    # Validate project exists
    project = ProjectQueries.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    
    # Validate geomarker belongs to project
    geomarker = GeomarkerQueries.get_by_id(run_data.geomarker_id)
    if not geomarker or geomarker["project_id"] != project_id:
        raise HTTPException(
            status_code=400,
            detail=f"Geomarker {run_data.geomarker_id} does not belong to project {project_id}"
        )
    
    # Create run with status 'queued'
    run_dict = {
        "project_id": project_id,
        "geomarker_id": run_data.geomarker_id,
        "start_date": run_data.start_date.isoformat(),
        "end_date": run_data.end_date.isoformat(),
        "cadence": run_data.cadence,
        "method": run_data.method,
        "cloud_threshold": run_data.cloud_threshold,
        "parameters": run_data.parameters or {},
        "status": "queued",
    }
    
    created_run = RunQueries.create(run_dict)
    
    return RunCreateResponse(
        run_id=created_run["id"],
        status=created_run["status"]
    )


def get_run_detail(run_id: str) -> RunDetail:
    """Get full run details"""
    run = RunQueries.get_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    
    return RunDetail(**run)


def get_run_reports(run_id: str) -> ReportsResponse:
    """Get all reports for a run"""
    run = RunQueries.get_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
    
    reports_data = ReportQueries.get_by_run_id(run_id)
    reports = [ReportBase(**r) for r in reports_data]
    
    return ReportsResponse(run_id=run_id, reports=reports)


def process_gee_result(gee_data: GEEResultInput) -> GEEResultResponse:
    """
    Process results submitted by GEE pipeline.
    
    This is called by the GEE pipeline after satellite analysis completes.
    
    Actions performed:
    1. Validate run exists
    2. Extract affected area from stats
    3. Calculate risk label based on deforestation severity:
       - >= 10 hectares: HIGH risk
       - >= 3 hectares: MEDIUM risk
       - > 0 hectares: LOW risk
       - 0 hectares: UNKNOWN
    4. Update run with:
       - status='completed'
       - stats (all analysis metrics)
       - hectares_change (total affected area)
       - finished_at (completion timestamp)
    5. Update project risk_label
    6. Create report entries for:
       - before_image
       - after_image
       - delta_map
       - loss_polygons_geojson
    
    Args:
        gee_data: Results from GEE pipeline with stats, URLs, metadata
    
    Returns:
        Success response with run_id and status
    """
    run = RunQueries.get_by_id(gee_data.run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {gee_data.run_id} not found")
    
    # Extract affected area for risk calculation
    affected_area_ha = gee_data.stats.get("affected_area_ha", 0)
    
    # Determine risk label based on deforestation severity
    if affected_area_ha >= 10:
        risk_label = "high"
    elif affected_area_ha >= 3:
        risk_label = "medium"
    elif affected_area_ha > 0:
        risk_label = "low"
    else:
        risk_label = "unknown"
    
    # Merge output URLs into stats.images for easier frontend access
    stats_with_images = dict(gee_data.stats or {})
    existing_images = stats_with_images.get("images") or {}
    output_images = {}

    # Support both legacy and new output keys
    outputs = gee_data.outputs or {}
    if outputs.get("before_image_url"):
        output_images["before_rgb"] = outputs["before_image_url"]
    if outputs.get("after_image_url"):
        output_images["after_rgb"] = outputs["after_image_url"]
    if outputs.get("delta_map_url"):
        output_images["delta_ndvi"] = outputs["delta_map_url"]
    if outputs.get("before_rgb"):
        output_images["before_rgb"] = outputs["before_rgb"]
    if outputs.get("after_rgb"):
        output_images["after_rgb"] = outputs["after_rgb"]
    if outputs.get("delta_ndvi"):
        output_images["delta_ndvi"] = outputs["delta_ndvi"]

    if output_images:
        stats_with_images["images"] = {**existing_images, **output_images}

    # Update run with completed status and results
    run_update = {
        "status": "completed",
        "stats": stats_with_images,
        "hectares_change": affected_area_ha,
        "finished_at": datetime.utcnow().isoformat(),
    }
    RunQueries.update(gee_data.run_id, run_update)
    
    # Update project risk label based on latest analysis
    ProjectQueries.update(gee_data.project_id, {"risk_label": risk_label})
    
    # Create report entries for frontend to display
    reports_to_create = []
    
    # Map GEE output URLs to report types
    output_mapping = {
        "before_image_url": "before_image",
        "after_image_url": "after_image",
        "delta_map_url": "delta_map",
        "before_rgb": "before_image",
        "after_rgb": "after_image",
        "delta_ndvi": "delta_map",
    }
    
    for key, report_type in output_mapping.items():
        if key in gee_data.outputs and gee_data.outputs[key]:
            reports_to_create.append({
                "run_id": gee_data.run_id,
                "report_type": report_type,
                "public_url": gee_data.outputs[key],
                "metadata": gee_data.metadata,  # Satellite info, processing date
            })
    
    # Add loss polygons GeoJSON
    if gee_data.loss_polygons_url:
        reports_to_create.append({
            "run_id": gee_data.run_id,
            "report_type": "loss_polygons_geojson",
            "public_url": gee_data.loss_polygons_url,
            "metadata": gee_data.metadata,
        })
    
    # Batch create all reports
    if reports_to_create:
        ReportQueries.create_many(reports_to_create)
    
    return GEEResultResponse(
        success=True,
        run_id=gee_data.run_id,
        status="completed",
        message=f"Run completed successfully. Risk level: {risk_label}"
    )


# Keep mock function for backward compatibility
def get_deforestation_result(project_id: str, latest: bool = True) -> DeforestationResponse:
    run_id = str(uuid.uuid4())
    polygons = [
        DeforestationPolygon(
            id=str(uuid.uuid4()),
            area_ha=2.3,
            confidence="high",
            geometry={"type": "Polygon", "coordinates": [[[0,0],[0,1],[1,1],[0,0]]]},
        )
    ]
    return DeforestationResponse(
        project_id=project_id,
        run_id=run_id,
        start_date="2026-01-01",
        end_date="2026-01-28",
        stats=DeforestationStats(area_ha=2.3, polygon_count=len(polygons)),
        outputs=OutputLinks(
            before_rgb=None,
            after_rgb=None,
            delta_png=None,
            report_pdf=None,
            polygons_geojson=None,
        ),
        polygons=polygons,
    )
