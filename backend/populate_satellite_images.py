"""
Populate Satellite Images for All Projects

This script will:
1. Get all active projects from your database
2. For each project, fetch current and historical satellite images
3. Store the images in Supabase storage
4. Update the project records with image URLs

You can run this:
- Once to populate all projects
- Scheduled (daily/weekly) to update with fresh imagery
"""

from datetime import datetime, timedelta
from app.db.queries import ProjectQueries, GeomarkerQueries
from app.services.sentinel_service import get_sentinel_service
from app.db.session import supabase
import json

def get_bbox_from_geojson(geojson: dict) -> tuple:
    """Extract bounding box from GeoJSON"""
    import geopandas as gpd
    
    # Handle both Feature and FeatureCollection
    if geojson.get('type') == 'Feature':
        gdf = gpd.GeoDataFrame.from_features([geojson])
    else:
        gdf = gpd.GeoDataFrame.from_features(geojson)
    
    bounds = gdf.total_bounds  # (minx, miny, maxx, maxy)
    return tuple(bounds)


def populate_project_images(project_id: str, days_back: int = 30):
    """Fetch and store satellite images for a single project
    
    Args:
        project_id: Project ID to process
        days_back: How many days back for the baseline image
    
    Returns:
        dict with image URLs
    """
    print(f"\n📍 Processing project: {project_id}")
    
    # Get project geomarker (boundary)
    geomarker = GeomarkerQueries.get_active_for_project(project_id)
    
    if not geomarker:
        # Try to get any geomarker
        history = GeomarkerQueries.get_history_for_project(project_id)
        if not history:
            print(f"   ⚠️  No geomarker found, skipping")
            return None
        geomarker = history[0]
    
    geojson = geomarker['geojson']
    
    # Get bounding box
    try:
        bbox = get_bbox_from_geojson(geojson)
        print(f"   📦 BBox: {bbox}")
    except Exception as e:
        print(f"   ❌ Failed to get bbox: {e}")
        return None
    
    # Get Sentinel service
    service = get_sentinel_service()
    
    # Define dates
    date_current = datetime.now()
    date_baseline = date_current - timedelta(days=days_back)
    
    try:
        # Fetch baseline image
        print(f"   🛰️  Fetching baseline image ({date_baseline.date()})...")
        rgb_baseline, _ = service.fetch_rgb_image(
            bbox=bbox,
            date_from=date_baseline - timedelta(days=7),
            date_to=date_baseline + timedelta(days=7),
            resolution=20,  # 20m for faster processing
            max_cloud_coverage=30
        )
        
        # Fetch current image
        print(f"   🛰️  Fetching current image ({date_current.date()})...")
        rgb_current, _ = service.fetch_rgb_image(
            bbox=bbox,
            date_from=date_current - timedelta(days=7),
            date_to=date_current + timedelta(days=7),
            resolution=20,
            max_cloud_coverage=30
        )
        
        # Save images
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        base_path = f"projects/{project_id}/satellite"
        
        print(f"   💾 Saving images...")
        baseline_url = service.save_rgb_image(
            rgb_baseline,
            f"{base_path}/baseline_{timestamp}.png"
        )
        
        current_url = service.save_rgb_image(
            rgb_current,
            f"{base_path}/current_{timestamp}.png"
        )
        
        print(f"   ✅ Success!")
        print(f"      Baseline: {baseline_url}")
        print(f"      Current:  {current_url}")
        
        return {
            "before_rgb": baseline_url,
            "after_rgb": current_url,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return None


def update_project_with_images(project_id: str, image_urls: dict):
    """Update project record with satellite image URLs
    
    Stores the latest image in projects.image_url and optionally
    stores full image metadata in projects.satellite_images (if it exists).
    """
    update_payload = {
        "image_url": image_urls.get("after_rgb") or image_urls.get("before_rgb"),
        "updated_at": datetime.now().isoformat(),
    }

    try:
        supabase.table("projects").update(update_payload).eq("id", project_id).execute()
        print(f"   💾 Updated database record (image_url)")
    except Exception as e:
        print(f"   ⚠️  Database update failed for image_url: {e}")

    # Optional: store full image metadata if the column exists
    try:
        supabase.table("projects").update({
            "satellite_images": json.dumps(image_urls),
            "updated_at": datetime.now().isoformat(),
        }).eq("id", project_id).execute()
        print(f"   💾 Updated database record (satellite_images)")
    except Exception:
        # Column may not exist; ignore
        pass


def populate_all_projects(limit: int = None, days_back: int = 30):
    """Populate satellite images for all projects
    
    Args:
        limit: Maximum number of projects to process (None = all)
        days_back: Days back for baseline image
    """
    print("=" * 70)
    print("POPULATE SATELLITE IMAGES FOR ALL PROJECTS")
    print("=" * 70)
    
    # Get all projects
    projects = ProjectQueries.get_all_with_relations()
    
    if limit:
        projects = projects[:limit]
    
    print(f"\n📊 Found {len(projects)} projects to process")
    
    success_count = 0
    failed_count = 0
    
    for i, project in enumerate(projects, 1):
        project_id = project['id']
        project_name = project.get('name', 'Unknown')
        
        print(f"\n[{i}/{len(projects)}] {project_name}")
        
        # Fetch images
        image_urls = populate_project_images(project_id, days_back)
        
        if image_urls:
            # Update database
            update_project_with_images(project_id, image_urls)
            success_count += 1
        else:
            failed_count += 1
    
    print("\n" + "=" * 70)
    print(f"✅ Successfully processed: {success_count}")
    print(f"❌ Failed: {failed_count}")
    print("=" * 70)


if __name__ == "__main__":
    import sys
    
    print("\n🛰️  Satellite Image Population Script")
    print("=" * 70)
    
    # Parse arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--help':
            print("\nUsage:")
            print("  python populate_satellite_images.py                       # Process all projects")
            print("  python populate_satellite_images.py --test                # Process first 3 projects")
            print("  python populate_satellite_images.py --project <id>        # Process specific project")
            print("  python populate_satellite_images.py --limit 10            # Process first 10 projects")
            sys.exit(0)
        
        elif sys.argv[1] == '--test':
            print("\n🧪 TEST MODE: Processing first 3 projects\n")
            populate_all_projects(limit=3, days_back=30)
        
        elif sys.argv[1] == '--limit':
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            print(f"\n📊 Processing first {limit} projects\n")
            populate_all_projects(limit=limit, days_back=30)
        
        elif sys.argv[1] == '--project':
            # Single project
            project_id = sys.argv[2] if len(sys.argv) > 2 else None
            if not project_id:
                print("❌ Error: --project requires a project ID")
                sys.exit(1)
            print(f"\n📍 Processing single project: {project_id}\n")
            image_urls = populate_project_images(project_id, days_back=30)
            if image_urls:
                update_project_with_images(project_id, image_urls)
                print("\n✅ Complete!")
            else:
                print("\n❌ Failed!")
    
    else:
        # Process all projects
        response = input("\n⚠️  Process ALL projects? This may take a while. Continue? (y/n): ")
        if response.lower() == 'y':
            populate_all_projects(days_back=30)
        else:
            print("Cancelled. Use --test to process just 3 projects first.")
