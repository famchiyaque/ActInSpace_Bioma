from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(prefix="/alerts")

@router.get("")
def alerts(project_id: str | None = None, severity: str | None = None):
    now = datetime.now(timezone.utc).isoformat()
    return {
        "alerts": [
            {
                "id": "alert-1",
                "project_id": project_id or "demo-project-1",
                "severity": severity or "warning",
                "title": "Vegetation loss detected",
                "message": "Estimated 7.1 ha loss in the last monitoring window.",
                "created_at": now,
                "metric": {"area_ha": 7.1},
            }
        ]
    }

