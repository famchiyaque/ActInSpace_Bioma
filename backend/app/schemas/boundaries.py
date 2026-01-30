from pydantic import BaseModel, Field
from typing import Any

class BoundaryCreate(BaseModel):
    project_id: str
    boundary_type: str = Field(default="user_drawn")
    source: str = Field(default="user")
    geometry: dict[str, Any]
    notes: str | None = None

class BoundaryOut(BaseModel):
    id: str
    project_id: str
    boundary_type: str
    source: str
    is_active: bool = True
    geometry: dict[str, Any]
    notes: str | None = None
