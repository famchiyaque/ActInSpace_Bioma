"""
Quick script to check what images are in the database
"""

from app.db.session import supabase

# Check projects with image_url
print("=" * 60)
print("PROJECTS WITH image_url:")
print("=" * 60)
projects = supabase.table("projects").select("id, name, image_url").execute()
for p in projects.data:
    if p.get("image_url"):
        print(f"✓ {p['name']}: {p['image_url'][:80]}...")
    else:
        print(f"✗ {p['name']}: NO IMAGE")

# Check runs with stats.images
print("\n" + "=" * 60)
print("RUNS WITH stats.images:")
print("=" * 60)
runs = supabase.table("runs").select("id, project_id, stats, status").eq("status", "completed").execute()
for r in runs.data:
    stats = r.get("stats") or {}
    images = stats.get("images") or {}
    if images:
        print(f"✓ Run {r['id'][:8]}... has images:")
        for key, url in images.items():
            print(f"  - {key}: {url[:60]}...")
    else:
        print(f"✗ Run {r['id'][:8]}... NO IMAGES in stats")

# Check reports
print("\n" + "=" * 60)
print("REPORTS WITH public_url:")
print("=" * 60)
reports = supabase.table("reports").select("id, run_id, report_type, public_url").execute()
image_reports = [r for r in reports.data if r.get("report_type") in ["before_image", "after_image"] and r.get("public_url")]
if image_reports:
    for r in image_reports:
        print(f"✓ {r['report_type']}: {r['public_url'][:60]}...")
else:
    print("✗ NO IMAGE REPORTS FOUND")

print("\n" + "=" * 60)
print("SUMMARY:")
print("=" * 60)
projects_with_images = sum(1 for p in projects.data if p.get("image_url"))
runs_with_images = sum(1 for r in runs.data if (r.get("stats") or {}).get("images"))
print(f"Projects with image_url: {projects_with_images}/{len(projects.data)}")
print(f"Completed runs with stats.images: {runs_with_images}/{len(runs.data)}")
print(f"Image reports: {len(image_reports)}")
print("\n💡 If all zeros, you need to run: python populate_satellite_images.py")
