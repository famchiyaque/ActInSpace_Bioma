from pydantic import BaseModel
from typing import Any

class AlertOut(BaseModel):
    id: str
    project_id: str
    severity: str
    title: str
    message: str
    created_at: str
    geometry: dict[str, Any] | None = None
    metric: dict[str, Any] | None = None

class AlertsResponse(BaseModel):
    alerts: list[AlertOut]
