import uuid
from datetime import datetime, timezone
from app.schemas.alerts import AlertOut

def list_alerts(project_id: str | None, severity: str | None, limit: int) -> list[AlertOut]:
    alerts = [
        AlertOut(
            id=str(uuid.uuid4()),
            project_id=project_id or "demo-project",
            severity=severity or "warning",
            title="Vegetation loss detected",
            message="Estimated vegetation loss detected in the last monitoring window.",
            created_at=datetime.now(timezone.utc).isoformat(),
            geometry=None,
            metric={"area_ha": 2.3},
        )
    ]
    return alerts[:limit]
