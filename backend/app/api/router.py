from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.risk_map import router as risk_router
from app.api.routes.deforestation import router as deforestation_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.boundaries import router as boundaries_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(risk_router, tags=["risk-map"])
api_router.include_router(deforestation_router, tags=["deforestation"])
api_router.include_router(alerts_router, tags=["alerts"])
api_router.include_router(boundaries_router, tags=["boundaries"])
