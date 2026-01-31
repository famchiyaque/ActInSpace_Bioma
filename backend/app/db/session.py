from supabase import create_client
from app.config import settings

# Initialize Supabase client
supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)

def get_db():
    """Dependency for getting database client"""
    return supabase
