from typing import Generator
from app.config import settings
from app.db.session import get_db

def get_settings():
    return settings

def get_database():
    """FastAPI dependency for database access"""
    return get_db()
