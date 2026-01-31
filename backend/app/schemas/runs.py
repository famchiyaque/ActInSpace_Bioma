from pydantic import BaseModel, Field, field_validator
from typing import Any, Optional
from datetime import datetime, date

class OutputLinks(BaseModel):
    before_rgb: str | None = None
    after_rgb: str | None = None
    delta_png: str | None = None
    report_pdf: str | None = None
    polygons_geojson: str | None = None

class DeforestationStats(BaseModel):
    area_ha: float
    polygon_count: int

class DeforestationPolygon(BaseModel):
    id: str
    area_ha: float
    confidence: str
    geometry: dict[str, Any]

class DeforestationResponse(BaseModel):
    project_id: str
    run_id: str
    start_date: str
    end_date: str
    stats: DeforestationStats
    outputs: OutputLinks
    polygons: list[DeforestationPolygon]


# New schemas for run management
class RunCreate(BaseModel):
    geomarker_id: str
    start_date: date
    end_date: date
    cadence: str = "weekly"
    method: str = "ndvi"
    cloud_threshold: int = Field(default=30, ge=0, le=100)
    parameters: Optional[dict[str, Any]] = None

    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class RunCreateResponse(BaseModel):
    run_id: str
    status: str


class RunHistoryItem(BaseModel):
    id: str
    end_date: date
    hectares_change: Optional[float] = None
    status: str


class RunDetail(BaseModel):
    id: str
    project_id: str
    start_date: date
    end_date: date
    cadence: str
    method: str
    cloud_threshold: int
    hectares_change: Optional[float] = None
    summary: Optional[str] = None
    status: str
    created_at: datetime
    geomarker_id: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None
    stats: Optional[dict[str, Any]] = None
    finished_at: Optional[datetime] = None


class ReportBase(BaseModel):
    report_type: str
    public_url: Optional[str] = None
    storage_path: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
    created_at: datetime


class ReportsResponse(BaseModel):
    run_id: str
    reports: list[ReportBase]


class GEEResultInput(BaseModel):
    """Input from Google Earth Engine pipeline"""
    project_id: str
    run_id: str
    start_date: date
    end_date: date
    stats: dict[str, Any]
    loss_polygons_url: str
    outputs: dict[str, str]
    metadata: dict[str, Any]


class GEEResultResponse(BaseModel):
    success: bool
    run_id: str
    status: str
    message: str
