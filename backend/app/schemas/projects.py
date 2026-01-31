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
