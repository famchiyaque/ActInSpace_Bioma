from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Bioma API",
        version="0.1.0",
        description="Backend API for Bioma deforestation monitoring system"
    )
    
    # Configure CORS - Allow all origins for ngrok/demo deployment
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow any origin for ngrok demo
        allow_credentials=False,  # Must be False when allow_origins is ["*"]
        allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"],  # Allow all headers
    )
    
    app.include_router(api_router)
    return app

app = create_app()