from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime

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


# New schemas for geomarkers
class GeomarkerBase(BaseModel):
    id: str
    geomarker_type: str
    geojson: dict[str, Any]


class GeomarkerDetail(GeomarkerBase):
    project_id: str
    source_type: str
    source_note: Optional[str] = None
    version: int
    is_active: bool
    created_at: datetime


class GeomarkerHistory(BaseModel):
    id: str
    version: int
    geomarker_type: str
    source_type: str
    is_active: bool
    created_at: datetime


class GeomarkerData(BaseModel):
    active: Optional[GeomarkerDetail] = None
    history: list[GeomarkerHistory] = []
