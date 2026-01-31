"""Project API routes"""

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
    Create a new project.
    
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
    """
    return create_project(project_data)


@router.get("", response_model=ProjectsListResponse)
def list_projects(db=Depends(get_database)):
    """
    Get all projects with summary data for map view.
    
    Returns:
    - Project list with company, region, active geomarker, and last run data
    """
    return get_projects_list()


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: str, db=Depends(get_database)):
    """
    Get complete project details including:
    - Full project data
    - Active geomarker and history
    - Latest run with reports
    - Run history (last 10)
    """
    return get_project_detail(project_id)


@router.post("/{project_id}/runs", response_model=RunCreateResponse, status_code=201)
def create_project_run(
    project_id: str,
    run_data: RunCreate,
    db=Depends(get_database)
):
    """
    Create a new run for a project.
    
    Creates a run with status='queued' for processing by GEE pipeline.
    
    Validations:
    - Project must exist
    - Geomarker must belong to the project
    - end_date must be after start_date
    """
    return create_run(project_id, run_data)
