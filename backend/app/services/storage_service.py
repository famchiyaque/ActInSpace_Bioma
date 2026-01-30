from supabase import create_client
from app.config import settings

_sb = create_client(settings.supabase_url, settings.supabase_service_role_key)

def public_url(path: str, bucket: str | None = None) -> str:
    bucket = bucket or settings.supabase_bucket_results
    return _sb.storage.from_(bucket).get_public_url(path)

def upload_bytes(path: str, content: bytes, content_type: str, bucket: str | None = None) -> str:
    bucket = bucket or settings.supabase_bucket_results
    _sb.storage.from_(bucket).upload(
        path=path,
        file=content,
        file_options={"content-type": content_type},
    )
    return public_url(path, bucket=bucket)
