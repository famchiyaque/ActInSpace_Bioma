"""
Simple API endpoint to debug image URLs
"""

from fastapi import APIRouter
from app.db.session import supabase

router = APIRouter(prefix="/debug", tags=["debug"])

@router.get("/images")
def get_image_urls():
    """Get all image URLs from database for debugging"""
    
    result = {
        "projects": [],
        "runs": [],
        "reports": []
    }
    
    # Get projects with image_url
    projects = supabase.table("projects").select("id, name, image_url").limit(5).execute()
    for p in projects.data:
        if p.get("image_url"):
            result["projects"].append({
                "project_name": p["name"],
                "image_url": p["image_url"]
            })
    
    # Get runs with stats.images
    runs = supabase.table("runs").select("id, stats").eq("status", "completed").limit(5).execute()
    for r in runs.data:
        stats = r.get("stats") or {}
        images = stats.get("images") or {}
        if images:
            result["runs"].append({
                "run_id": r["id"],
                "images": images
            })
    
    # Get image reports
    reports = supabase.table("reports").select("report_type, public_url").in_("report_type", ["before_image", "after_image"]).limit(5).execute()
    for rep in reports.data:
        if rep.get("public_url"):
            result["reports"].append({
                "type": rep["report_type"],
                "url": rep["public_url"]
            })
    
    return result
