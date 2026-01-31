"""
Test script to check image URLs in database
"""

from app.db.session import supabase
import json

print("=" * 80)
print("CHECKING IMAGE URLs IN DATABASE")
print("=" * 80)

# Check projects table
print("\n1. PROJECTS TABLE - image_url column:")
print("-" * 80)
projects = supabase.table("projects").select("id, name, image_url").limit(10).execute()
for p in projects.data:
    print(f"\nProject: {p['name']}")
    print(f"  image_url: {p.get('image_url') or 'NULL'}")

# Check runs table - stats.images
print("\n\n2. RUNS TABLE - stats.images:")
print("-" * 80)
runs = supabase.table("runs").select("id, project_id, stats, status").eq("status", "completed").limit(10).execute()
for r in runs.data:
    stats = r.get("stats") or {}
    images = stats.get("images") or {}
    print(f"\nRun: {r['id'][:16]}...")
    print(f"  Status: {r['status']}")
    if images:
        for img_type, url in images.items():
            print(f"  {img_type}: {url}")
    else:
        print(f"  No images in stats")

# Check reports table
print("\n\n3. REPORTS TABLE - image URLs:")
print("-" * 80)
reports = supabase.table("reports").select("id, run_id, report_type, public_url").in_("report_type", ["before_image", "after_image"]).limit(10).execute()
for r in reports.data:
    print(f"\nReport: {r['report_type']}")
    print(f"  URL: {r.get('public_url') or 'NULL'}")

# Test if URL is accessible
print("\n\n4. TESTING URL ACCESSIBILITY:")
print("-" * 80)
test_url = None
if projects.data and projects.data[0].get('image_url'):
    test_url = projects.data[0]['image_url']
elif runs.data and runs.data[0].get('stats', {}).get('images', {}).get('after_rgb'):
    test_url = runs.data[0]['stats']['images']['after_rgb']
elif reports.data and reports.data[0].get('public_url'):
    test_url = reports.data[0]['public_url']

if test_url:
    print(f"Testing URL: {test_url}")
    import requests
    try:
        response = requests.head(test_url, timeout=5)
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('Content-Type')}")
        if response.status_code == 200:
            print("  ✓ URL IS ACCESSIBLE")
        else:
            print(f"  ✗ URL RETURNED ERROR: {response.status_code}")
    except Exception as e:
        print(f"  ✗ FAILED TO ACCESS: {e}")
else:
    print("No URLs found to test")

print("\n" + "=" * 80)
