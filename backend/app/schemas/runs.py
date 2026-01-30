from pydantic import BaseModel
from typing import Any

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
