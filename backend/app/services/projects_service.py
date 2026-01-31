"""Project service - business logic for project management

Project Service Layer

Handles all business logic for project operations.

Key Functions:
- create_project(): Creates new monitoring project (from frontend)
- get_projects_list(): Returns all projects for map view (frontend)
- get_project_detail(): Returns detailed project info (frontend)

Data Assembly:
- Joins data from multiple tables (projects, companies, regions, geomarkers, runs)
- Calculates carbon footprint from deforestation data
- Formats data for frontend consumption
"""

from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException
from app.db.queries import ProjectQueries, GeomarkerQueries, RunQueries, ReportQueries
from app.schemas.projects import (
    ProjectsListResponse,
    ProjectListItem,
    ProjectDetailResponse,
    ProjectDetailData,
    ProjectCreate,
    ProjectCreateResponse,
)
from app.schemas.common import CompanyBase, RegionBase
from app.schemas.boundaries import GeomarkerBase, GeomarkerData, GeomarkerDetail, GeomarkerHistory
from app.schemas.runs import RunHistoryItem, RunDetail, ReportBase


def create_project(project_data: ProjectCreate) -> ProjectCreateResponse:
    """Create a new project"""
    # Build project dictionary
    project_dict = {
        "name": project_data.name,
        "description": project_data.description,
        "region_id": project_data.region_id,
        "company_id": project_data.company_id,
        "status": project_data.status,
        "risk_label": "unknown",  # Default risk label
        "monitoring_start_date": project_data.monitoring_start_date.isoformat() if project_data.monitoring_start_date else None,
        "monitoring_end_date": project_data.monitoring_end_date.isoformat() if project_data.monitoring_end_date else None,
    }
    
    # Create project in database
    created = ProjectQueries.create(project_dict)
    
    return ProjectCreateResponse(
        id=created["id"],
        name=created["name"],
        status=created["status"],
        risk_label=created["risk_label"],
        created_at=created["created_at"]
    )


def get_projects_list() -> ProjectsListResponse:
    """
    Get all projects with summary data for map view.
    
    Used by frontend to populate the main map interface.
    
    Data Assembly:
    1. Fetches all projects with company and region joins
    2. For each project:
       - Gets active geomarker (highest version, is_active=true)
       - Gets last completed run (latest end_date)
       - Calculates carbon footprint (hectares × 400 tonnes CO2/ha)
    
    Carbon Footprint Calculation:
    - Based on deforestation area from last run
    - Formula: hectares_change × 400 tonnes CO2/hectare
    - 400 tonnes/ha is average for tropical forests
    - Returns null if no deforestation data available
    
    Returns:
        ProjectsListResponse with list of projects including:
        - Basic info, company, region
        - Active geomarker with GeoJSON for map rendering
        - Last run results
        - Carbon footprint estimation
    """
    projects_data = ProjectQueries.get_all_with_relations()
    print("Projects data:", projects_data)
    
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
        try:
            geomarker_data = GeomarkerQueries.get_active_for_project(proj["id"])
            if geomarker_data:
                active_geomarker = GeomarkerBase(
                    id=geomarker_data["id"],
                    geomarker_type=geomarker_data["geomarker_type"],
                    geojson=geomarker_data["geojson"]
                )
        except Exception as e:
            # Log but don't fail if geomarker query fails
            print(f"Warning: Could not fetch geomarker for project {proj['id']}: {e}")
        
        # Get last run
        last_run = None
        carbon_footprint = None
        latest_image_url = None
        try:
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
                
                # Get latest photograph from reports (prefer after_image, fallback to before_image)
                reports = ReportQueries.get_by_run_id(last_run_data["id"])
                for report in reports:
                    if report["report_type"] == "after_image" and report.get("public_url"):
                        latest_image_url = report["public_url"]
                        break
                # Fallback to before_image if no after_image
                if not latest_image_url:
                    for report in reports:
                        if report["report_type"] == "before_image" and report.get("public_url"):
                            latest_image_url = report["public_url"]
                            break
        except Exception as e:
            # Log but don't fail if run/report query fails
            print(f"Warning: Could not fetch runs/reports for project {proj['id']}: {e}")
        
        # Debug: Log image URLs being sent
        print(f"[Project {proj['name']}] Images: image_url={proj.get('image_url')}, latest_image_url={latest_image_url}")
        
        projects_list.append(ProjectListItem(
            id=proj["id"],
            name=proj["name"],
            status=proj["status"],
            risk_label=proj["risk_label"],
            company=company,
            region=region,
            active_geomarker=active_geomarker,
            last_run=last_run,
            carbon_footprint_tonnes=carbon_footprint,
            latest_image_url=latest_image_url,
            center_lat=proj.get("center_lat"),
            center_lng=proj.get("center_lng"),
            image_url=proj.get("image_url")
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
