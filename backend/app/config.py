from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    supabase_url: str
    supabase_service_role_key: str
    supabase_bucket_results: str = "results"  # Default bucket name for exports
    gee_project_id: str  # Google Earth Engine project ID

settings = Settings()
