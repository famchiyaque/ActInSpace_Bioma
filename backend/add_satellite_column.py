"""
Add satellite_images column to projects table

Run this SQL in Supabase SQL Editor:
https://dpftjteijqfsoqmpojyr.supabase.co/project/_/sql/new
"""

sql = """
-- Add satellite_images column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS satellite_images JSONB;

-- Add comment
COMMENT ON COLUMN projects.satellite_images IS 'Stores satellite image URLs and metadata';

-- Example of what will be stored:
-- {
--   "baseline_image_url": "https://...png",
--   "current_image_url": "https://...png",
--   "last_updated": "2026-01-31T12:00:00"
-- }
"""

print("=" * 70)
print("ADD SATELLITE IMAGES COLUMN TO DATABASE")
print("=" * 70)
print("\n1. Go to Supabase SQL Editor:")
print("   https://dpftjteijqfsoqmpojyr.supabase.co/project/_/sql/new")
print("\n2. Copy and run this SQL:\n")
print(sql)
print("\n3. Then run the population script:")
print("   python populate_satellite_images.py --test")
print("=" * 70)
