"""Run API routes"""

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
    Get complete run details including all fields, parameters, and stats.
    """
    return get_run_detail(run_id)


@router.get("/{run_id}/reports", response_model=ReportsResponse)
def get_reports(run_id: str, db=Depends(get_database)):
    """
    Get all reports for a specific run.
    
    Returns:
    - List of reports with type, URLs, and metadata
    """
    return get_run_reports(run_id)


@router.post("/{run_id}/gee-result", response_model=GEEResultResponse)
def submit_gee_result(
    run_id: str,
    gee_data: GEEResultInput,
    db=Depends(get_database)
):
    """
    Endpoint for GEE pipeline to submit processing results.
    
    Updates:
    - Run status to 'completed'
    - Run stats and hectares_change
    - Project risk_label based on affected area
    - Creates report entries for all output URLs
    
    Risk calculation:
    - affected_area_ha >= 10: 'high'
    - >= 3 and < 10: 'medium'
    - < 3: 'low'
    - No data: 'unknown'
    """
    # Validate run_id matches
    if gee_data.run_id != run_id:
        raise HTTPException(
            status_code=400,
            detail="run_id in URL does not match run_id in body"
        )
    
    return process_gee_result(gee_data)
