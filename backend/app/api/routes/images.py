"""
Image proxy endpoint to serve images through backend and avoid CORS issues
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import httpx
from io import BytesIO

router = APIRouter(prefix="/images", tags=["images"])

# Simple in-memory cache (in production, use Redis)
_image_cache = {}

@router.get("/proxy")
async def get_image_proxy(url: str):
    """
    Proxy endpoint to fetch images from Supabase storage.
    
    Returns the image directly as binary data with proper CORS headers.
    
    Usage: GET /images/proxy?url=https://...
    """
    
    # Security: only allow supabase.co URLs
    if "supabase.co" not in url or "storage" not in url:
        raise HTTPException(status_code=400, detail="Invalid image URL")
    
    # Check cache
    if url in _image_cache:
        cache_data = _image_cache[url]
        return StreamingResponse(
            BytesIO(cache_data['content']),
            media_type=cache_data['content_type'],
            headers={"Cache-Control": "max-age=86400"}
        )
    
    try:
        # Fetch image from Supabase
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to fetch image")
            
            content_type = response.headers.get("content-type", "image/png")
            
            # Cache it
            _image_cache[url] = {
                'content': response.content,
                'content_type': content_type
            }
            
            return StreamingResponse(
                BytesIO(response.content),
                media_type=content_type,
                headers={"Cache-Control": "max-age=86400"}
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch image: {str(e)}")


@router.get("/clear-cache")
def clear_cache():
    """Clear the image cache"""
    global _image_cache
    count = len(_image_cache)
    _image_cache = {}
    return {"message": f"Cleared {count} cached images"}
