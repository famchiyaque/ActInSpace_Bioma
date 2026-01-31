from fastapi import APIRouter
from datetime import datetime
from app.schemas.common import HealthResponse

router = APIRouter(prefix="/health")

@router.get("", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", timestamp=datetime.utcnow())
