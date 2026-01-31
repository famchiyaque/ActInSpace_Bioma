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


def upload_file(local_path: str, storage_path: str, content_type: str, bucket: str | None = None) -> str:
    """
    Upload a file from local filesystem to Supabase Storage.
    
    Args:
        local_path: Path to local file
        storage_path: Destination path in storage bucket
        content_type: MIME type (e.g., 'image/tiff', 'application/geo+json')
        bucket: Optional bucket name, defaults to supabase_bucket_results
    
    Returns:
        Public URL of uploaded file
    """
    bucket = bucket or settings.supabase_bucket_results
    
    with open(local_path, 'rb') as f:
        file_data = f.read()
    
    _sb.storage.from_(bucket).upload(
        path=storage_path,
        file=file_data,
        file_options={"content-type": content_type},
    )
    
    return public_url(storage_path, bucket=bucket)
