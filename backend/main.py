from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Bioma API",
        version="0.1.0",
        description="Backend API for Bioma deforestation monitoring system"
    )
    
    # Configure CORS for frontend communication
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React/Next.js default
            "http://localhost:5173",  # Vite default
            "http://localhost:5174",  # Vite alternative port
            "http://localhost:8080",  # Vue default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            # Add your production frontend URL here
        ],
        allow_credentials=True,
        allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        allow_headers=["*"],  # Allow all headers
    )
    
    app.include_router(api_router)
    return app

app = create_app()