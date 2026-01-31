# Run service - business logic for run management

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
    """Process GEE pipeline results"""
    run = RunQueries.get_by_id(gee_data.run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run {gee_data.run_id} not found")
    
    # Extract affected area
    affected_area_ha = gee_data.stats.get("affected_area_ha", 0)
    
    # Determine risk label
    if affected_area_ha >= 10:
        risk_label = "high"
    elif affected_area_ha >= 3:
        risk_label = "medium"
    elif affected_area_ha > 0:
        risk_label = "low"
    else:
        risk_label = "unknown"
    
    # Update run status
    run_update = {
        "status": "completed",
        "stats": gee_data.stats,
        "hectares_change": affected_area_ha,
        "finished_at": datetime.utcnow().isoformat(),
    }
    RunQueries.update(gee_data.run_id, run_update)
    
    # Update project risk label
    ProjectQueries.update(gee_data.project_id, {"risk_label": risk_label})
    
    # Create report entries
    reports_to_create = []
    
    # Map output URLs to report types
    output_mapping = {
        "before_image_url": "before_image",
        "after_image_url": "after_image",
        "delta_map_url": "delta_map",
    }
    
    for key, report_type in output_mapping.items():
        if key in gee_data.outputs and gee_data.outputs[key]:
            reports_to_create.append({
                "run_id": gee_data.run_id,
                "report_type": report_type,
                "public_url": gee_data.outputs[key],
                "metadata": gee_data.metadata,
            })
    
    # Add loss polygons
    if gee_data.loss_polygons_url:
        reports_to_create.append({
            "run_id": gee_data.run_id,
            "report_type": "loss_polygons_geojson",
            "public_url": gee_data.loss_polygons_url,
            "metadata": gee_data.metadata,
        })
    
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
