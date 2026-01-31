"""Project service - business logic for project management"""

from typing import List, Optional
from fastapi import HTTPException
from app.db.queries import ProjectQueries, GeomarkerQueries, RunQueries, ReportQueries
from app.schemas.projects import (
    ProjectsListResponse,
    ProjectListItem,
    ProjectDetailResponse,
    ProjectDetailData,
)
from app.schemas.common import CompanyBase, RegionBase
from app.schemas.boundaries import GeomarkerBase, GeomarkerData, GeomarkerDetail, GeomarkerHistory
from app.schemas.runs import RunHistoryItem, RunDetail, ReportBase


def get_projects_list() -> ProjectsListResponse:
    """Get all projects with summary data for map view"""
    projects_data = ProjectQueries.get_all_with_relations()
    
    projects_list = []
    for proj in projects_data:
        # Build company
        company = None
        if proj.get("company"):
            company = CompanyBase(
                id=proj["company"]["id"],
                name=proj["company"]["name"]
            )
        
        # Build region
        region = None
        if proj.get("region"):
            region = RegionBase(
                id=proj["region"]["id"],
                name=proj["region"]["name"],
                country_code=proj["region"].get("country_code")
            )
        
        # Get active geomarker
        active_geomarker = None
        geomarker_data = GeomarkerQueries.get_active_for_project(proj["id"])
        if geomarker_data:
            active_geomarker = GeomarkerBase(
                id=geomarker_data["id"],
                geomarker_type=geomarker_data["geomarker_type"],
                geojson=geomarker_data["geojson"]
            )
        
        # Get last run
        last_run = None
        carbon_footprint = None
        last_run_data = RunQueries.get_last_completed_for_project(proj["id"])
        if last_run_data:
            last_run = RunHistoryItem(
                id=last_run_data["id"],
                end_date=last_run_data["end_date"],
                hectares_change=last_run_data.get("hectares_change"),
                status=last_run_data["status"]
            )
            # Calculate carbon footprint: hectares * 400 tonnes CO2/hectare (tropical forest average)
            if last_run_data.get("hectares_change"):
                carbon_footprint = last_run_data["hectares_change"] * 400
        
        projects_list.append(ProjectListItem(
            id=proj["id"],
            name=proj["name"],
            status=proj["status"],
            risk_label=proj["risk_label"],
            company=company,
            region=region,
            active_geomarker=active_geomarker,
            last_run=last_run,
            carbon_footprint_tonnes=carbon_footprint
        ))
    
    return ProjectsListResponse(projects=projects_list)


def get_project_detail(project_id: str) -> ProjectDetailResponse:
    """Get complete project details"""
    # Get project
    proj = ProjectQueries.get_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    
    # Build company
    company = None
    if proj.get("company"):
        company = CompanyBase(
            id=proj["company"]["id"],
            name=proj["company"]["name"]
        )
    
    # Build region
    region = None
    if proj.get("region"):
        region = RegionBase(
            id=proj["region"]["id"],
            name=proj["region"]["name"],
            country_code=proj["region"].get("country_code")
        )
    
    # Build project data
    project_data = ProjectDetailData(
        id=proj["id"],
        name=proj["name"],
        description=proj.get("description"),
        status=proj["status"],
        risk_label=proj["risk_label"],
        monitoring_start_date=proj.get("monitoring_start_date"),
        monitoring_end_date=proj.get("monitoring_end_date"),
        company=company,
        region=region,
        created_at=proj["created_at"],
        updated_at=proj["updated_at"]
    )
    
    # Get geomarkers
    active_geomarker = None
    active_data = GeomarkerQueries.get_active_for_project(project_id)
    if active_data:
        active_geomarker = GeomarkerDetail(**active_data)
    
    history_data = GeomarkerQueries.get_history_for_project(project_id)
    history = [GeomarkerHistory(**h) for h in history_data]
    
    geomarkers = GeomarkerData(active=active_geomarker, history=history)
    
    # Get latest run
    latest_run = None
    latest_run_data = RunQueries.get_last_completed_for_project(project_id)
    if latest_run_data:
        latest_run = RunDetail(**latest_run_data)
    
    # Get reports for latest run
    reports = []
    if latest_run:
        reports_data = ReportQueries.get_by_run_id(latest_run.id)
        reports = [ReportBase(**r) for r in reports_data]
    
    # Get run history
    run_history_data = RunQueries.get_history_for_project(project_id, limit=10)
    run_history = [RunHistoryItem(**r) for r in run_history_data]
    
    return ProjectDetailResponse(
        project=project_data,
        geomarkers=geomarkers,
        latest_run=latest_run,
        reports=reports,
        run_history=run_history
    )
