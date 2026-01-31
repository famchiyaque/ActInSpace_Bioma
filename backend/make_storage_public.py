"""
Make Supabase storage bucket public for image access
"""

from app.db.session import supabase

bucket_name = "results"

print(f"Making '{bucket_name}' bucket publicly accessible...")

try:
    # Try to update bucket to public
    response = supabase.storage.get_bucket(bucket_name)
    print(f"✓ Bucket exists: {response}")
    
    # Make bucket public
    supabase.storage.update_bucket(bucket_name, {"public": True})
    print(f"✓ Bucket '{bucket_name}' is now PUBLIC")
    
    # List some files to verify
    files = supabase.storage.from_(bucket_name).list(limit=5)
    print(f"\n📁 Sample files in bucket:")
    for f in files[:5]:
        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(f['name'])
        print(f"  - {f['name']}: {public_url}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 To make bucket public manually:")
    print("   1. Go to Supabase Dashboard > Storage")
    print(f"   2. Find '{bucket_name}' bucket")
    print("   3. Click settings (⚙️)")
    print("   4. Toggle 'Public bucket' to ON")
