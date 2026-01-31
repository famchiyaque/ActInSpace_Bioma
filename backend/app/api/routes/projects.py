"""Project API routes

These endpoints are primarily used by the FRONTEND to manage projects.

Frontend Usage:
- POST /projects - Create new monitoring projects
- GET /projects - Get list of all projects for map view
- GET /projects/{id} - Get detailed project information
- POST /projects/{id}/runs - Trigger new analysis run (queues for GEE processing)
"""

from fastapi import APIRouter, Depends, HTTPException
from app.services.projects_service import get_projects_list, get_project_detail, create_project
from app.services.runs_service import create_run
from app.schemas.projects import ProjectsListResponse, ProjectDetailResponse, ProjectCreate, ProjectCreateResponse
from app.schemas.runs import RunCreate, RunCreateResponse
from app.deps import get_database

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectCreateResponse, status_code=201)
def create_new_project(project_data: ProjectCreate, db=Depends(get_database)):
    """
    [FRONTEND] Create a new monitoring project.
    
    Used when user creates a new project from the frontend interface.
    
    Request body:
    - name: Project name (required)
    - description: Project description (optional)
    - region_id: UUID of region (optional)
    - company_id: UUID of company (optional)
    - monitoring_start_date: Start date for monitoring (optional)
    - monitoring_end_date: End date for monitoring (optional)
    - status: Project status, default 'active' (optional)
    
    Returns:
    - Created project with ID and initial risk_label='unknown'
    
    Next Steps:
    1. Frontend should create a geomarker (boundary) for this project
    2. Then trigger first run via POST /projects/{id}/runs
    """
    return create_project(project_data)


@router.get("", response_model=ProjectsListResponse)
def list_projects(db=Depends(get_database)):
    """
    [FRONTEND] Get all projects with summary data for map view.
    
    Used to populate the main map interface showing all monitoring projects.
    
    Returns for each project:
    - Basic info: id, name, status, risk_label
    - Company and region details
    - Active geomarker with GeoJSON (for map rendering)
    - Last completed run (to show recent analysis results)
    - Carbon footprint calculation (tonnes CO2 from deforestation)
    
    Frontend Usage:
    - Display projects as markers/polygons on map
    - Color-code by risk_label (high/medium/low/unknown)
    - Show carbon impact in project cards
    - Use active_geomarker.geojson to draw boundaries
    """
    return get_projects_list()


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: str, db=Depends(get_database)):
    """
    [FRONTEND] Get complete project details for project detail page.
    
    Returns comprehensive data including:
    - Full project data: name, description, dates, status, risk
    - Geomarkers: active boundary + history of boundary changes
    - Latest run: complete analysis results with stats and parameters
    - Reports: all generated images/maps from latest run
    - Run history: last 10 runs to show trend over time
    
    Frontend Usage:
    - Display project detail page/modal
    - Show analysis reports (before/after images, delta maps)
    - Render charts from run history
    - Display geomarker version history
    - Download reports from report URLs
    """
    return get_project_detail(project_id)


@router.post("/{project_id}/runs", response_model=RunCreateResponse, status_code=201)
def create_project_run(
    project_id: str,
    run_data: RunCreate,
    db=Depends(get_database)
):
    """
    [FRONTEND] Trigger a new deforestation analysis run.
    
    Creates a run with status='queued' for processing by GEE pipeline.
    
    Frontend sends:
    - geomarker_id: Which boundary to analyze
    - start_date/end_date: Time period for analysis
    - method: Analysis method (e.g., 'ndvi')
    - cloud_threshold: Max cloud cover percentage
    - parameters: Custom analysis parameters (optional)
    
    Validations:
    - Project must exist
    - Geomarker must belong to the project
    - end_date must be after start_date
    
    Flow:
    1. Frontend triggers this endpoint
    2. Run created with status='queued'
    3. GEE pipeline picks up queued runs
    4. GEE processes and calls POST /runs/{id}/gee-result
    5. Frontend polls GET /runs/{id} to check status
    """
    return create_run(project_id, run_data)
