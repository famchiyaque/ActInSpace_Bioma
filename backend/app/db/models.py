"""Database models - Define your Supabase table structures here"""

from typing import Optional, List, Dict, Any
from datetime import datetime, date

# Models matching Supabase schema

class Company(dict):
    """Company model"""
    id: str
    name: str
    website: Optional[str]
    description: Optional[str]
    created_at: datetime


class Region(dict):
    """Region model"""
    id: str
    name: str
    country_code: Optional[str]
    admin_level: Optional[str]
    created_at: datetime


class Project(dict):
    """Project model"""
    id: str
    name: str
    description: Optional[str]
    region_id: Optional[str]
    company_id: Optional[str]
    status: str
    risk_label: str
    monitoring_start_date: Optional[date]
    monitoring_end_date: Optional[date]
    created_at: datetime
    updated_at: datetime


class Geomarker(dict):
    """Geomarker model (boundaries)"""
    id: str
    project_id: str
    geomarker_type: str
    source_type: str
    source_note: Optional[str]
    version: int
    geojson: Dict[str, Any]
    is_active: bool
    created_at: datetime


class Run(dict):
    """Run model"""
    id: str
    project_id: str
    start_date: date
    end_date: date
    cadence: str
    method: str
    cloud_threshold: int
    hectares_change: Optional[float]
    summary: Optional[str]
    status: str
    created_at: datetime
    geomarker_id: Optional[str]
    parameters: Optional[Dict[str, Any]]
    stats: Optional[Dict[str, Any]]
    finished_at: Optional[datetime]


class Report(dict):
    """Report model"""
    id: str
    run_id: str
    report_type: str
    storage_path: Optional[str]
    public_url: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
