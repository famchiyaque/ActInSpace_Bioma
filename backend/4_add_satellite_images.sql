-- Add satellite_images JSONB column to projects table
-- This will store baseline and current satellite image URLs
--
-- Example structure:
-- {
--   "baseline": "https://...storage.../satellite/baseline_20260101.png",
--   "current": "https://...storage.../satellite/current_20260131.png",
--   "last_updated": "2026-01-31T04:07:10Z"
-- }

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS satellite_images JSONB;

-- Create index for querying
CREATE INDEX IF NOT EXISTS idx_projects_satellite_images 
ON projects USING GIN (satellite_images);

-- Add comment
COMMENT ON COLUMN projects.satellite_images IS 'Satellite image URLs from Sentinel-2 (baseline and current)';
