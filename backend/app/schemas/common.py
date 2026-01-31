from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

GeoJSON = dict[str, Any]

class Message(BaseModel):
    message: str


class CompanyBase(BaseModel):
    id: str
    name: str


class CompanyDetail(CompanyBase):
    website: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime


class RegionBase(BaseModel):
    id: str
    name: str
    country_code: Optional[str] = None


class RegionDetail(RegionBase):
    admin_level: Optional[str] = None
    created_at: datetime


class ErrorResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
