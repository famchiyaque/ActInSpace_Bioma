# Replace with actual database interactions in the future

import uuid
from app.schemas.boundaries import BoundaryCreate, BoundaryOut

_BOUNDARIES: list[BoundaryOut] = []

def list_boundaries(project_id: str | None, active_only: bool = True) -> list[BoundaryOut]:
    out = _BOUNDARIES
    if project_id:
        out = [b for b in out if b.project_id == project_id]
    if active_only:
        out = [b for b in out if b.is_active]
    return out

def create_boundary(payload: BoundaryCreate) -> BoundaryOut:
    new_b = BoundaryOut(
        id=str(uuid.uuid4()),
        project_id=payload.project_id,
        boundary_type=payload.boundary_type,
        source=payload.source,
        geometry=payload.geometry,
        notes=payload.notes,
        is_active=True,
    )
    _BOUNDARIES.append(new_b)
    return new_b
