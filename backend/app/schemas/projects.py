from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime, date
from app.schemas.common import CompanyBase, RegionBase
from app.schemas.boundaries import GeomarkerBase, GeomarkerData
from app.schemas.runs import RunHistoryItem, RunDetail, ReportBase

class RiskProject(BaseModel):
    project_id: str
    name: str
    risk_label: str
    risk_score: float | None = None
    geometry: dict[str, Any] | None = None

class RiskMapResponse(BaseModel):
    projects: list[RiskProject]


# New schemas for project management
class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    name: str
    description: Optional[str] = None
    region_id: Optional[str] = None
    company_id: Optional[str] = None
    monitoring_start_date: Optional[date] = None
    monitoring_end_date: Optional[date] = None
    status: str = "active"


class ProjectCreateResponse(BaseModel):
    """Response after creating a project"""
    id: str
    name: str
    status: str
    risk_label: str
    created_at: datetime


class ProjectListItem(BaseModel):
    """Project item for list view"""
    id: str
    name: str
    status: str
    risk_label: str
    company: Optional[CompanyBase] = None
    region: Optional[RegionBase] = None
    active_geomarker: Optional[GeomarkerBase] = None
    last_run: Optional[RunHistoryItem] = None
    carbon_footprint_tonnes: Optional[float] = None
    latest_image_url: Optional[str] = None  # Most recent satellite image from last run
    center_lat: Optional[float] = None  # Latitude for map marker placement
    center_lng: Optional[float] = None  # Longitude for map marker placement
    image_url: Optional[str] = None  # Project image URL


class ProjectsListResponse(BaseModel):
    projects: list[ProjectListItem]


class ProjectDetailData(BaseModel):
    """Full project details"""
    id: str
    name: str
    description: Optional[str] = None
    status: str
    risk_label: str
    monitoring_start_date: Optional[date] = None
    monitoring_end_date: Optional[date] = None
    company: Optional[CompanyBase] = None
    region: Optional[RegionBase] = None
    created_at: datetime
    updated_at: datetime


class ProjectDetailResponse(BaseModel):
    """Complete project detail response"""
    project: ProjectDetailData
    geomarkers: GeomarkerData
    latest_run: Optional[RunDetail] = None
    reports: list[ReportBase] = []
    run_history: list[RunHistoryItem] = []
