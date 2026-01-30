from pydantic import BaseModel
from typing import Any

class RiskProject(BaseModel):
    project_id: str
    name: str
    risk_label: str
    risk_score: float | None = None
    geometry: dict[str, Any] | None = None

class RiskMapResponse(BaseModel):
    projects: list[RiskProject]
