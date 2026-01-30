from fastapi import APIRouter, HTTPException
from app.schemas.boundaries import BoundaryCreate, BoundaryOut
from app.services.boundaries_service import list_boundaries, create_boundary

router = APIRouter(prefix="/boundaries")

@router.get("", response_model=list[BoundaryOut])
def get_boundaries(project_id: str | None = None, active_only: bool = True):
    return list_boundaries(project_id=project_id, active_only=active_only)

@router.post("", response_model=BoundaryOut)
def post_boundary(payload: BoundaryCreate):
    try:
        return create_boundary(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
