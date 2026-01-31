-- ============================================================================
-- BIOMA DATABASE SEEDING - SQL TEMPLATES
-- ============================================================================
-- Use these SQL statements in Supabase SQL Editor to seed your database
-- https://app.supabase.com/project/YOUR-PROJECT/editor
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE COMPANIES
-- ============================================================================

-- Check existing companies first
SELECT id, name, website FROM companies ORDER BY name;

-- Insert companies (modify as needed)
INSERT INTO companies (name, website, description) 
VALUES 
  (
    'Grupo México Proyectos',
    'https://www.gmexico.com',
    'Mexican conglomerate responsible for major infrastructure projects including Tren Maya'
  ),
  (
    'Pemex',
    'https://www.pemex.com',
    'Mexican state-owned petroleum company responsible for energy infrastructure'
  ),
  (
    'FONATUR',
    'https://www.fonatur.gob.mx',
    'National Tourism Development Fund responsible for major tourism infrastructure'
  ),
  (
    'Constructora del Norte S.A.',
    'https://www.constructora-norte.mx',
    'Leading construction company specializing in infrastructure projects across northern Mexico'
  ),
  (
    'Desarrollos Urbanos SA',
    'https://www.desarrollosurbanos.mx',
    'Urban development and construction company'
  )
RETURNING id, name;

-- IMPORTANT: Save the returned IDs! You'll need them for projects.


-- ============================================================================
-- STEP 2: CREATE REGIONS
-- ============================================================================

-- Check existing regions first
SELECT id, name, country_code, admin_level FROM regions ORDER BY name;

-- Insert Mexican states (modify as needed)
INSERT INTO regions (name, country_code, admin_level) 
VALUES 
  ('Quintana Roo', 'MX', 'state'),
  ('Tabasco', 'MX', 'state'),
  ('Nuevo León', 'MX', 'state'),
  ('Ciudad de México', 'MX', 'state'),
  ('Jalisco', 'MX', 'state'),
  ('Veracruz', 'MX', 'state'),
  ('Estado de México', 'MX', 'state'),
  ('Guanajuato', 'MX', 'state'),
  ('Oaxaca', 'MX', 'state'),
  ('Chiapas', 'MX', 'state'),
  ('Campeche', 'MX', 'state'),
  ('Yucatán', 'MX', 'state')
RETURNING id, name;

-- IMPORTANT: Save the returned IDs! You'll need them for projects.


-- ============================================================================
-- STEP 3: CREATE PROJECTS
-- ============================================================================
-- Use the Python script (seed_projects.py) or the API for this step
-- See SEEDING_GUIDE.md for details


-- ============================================================================
-- STEP 4: CREATE GEOMARKERS (WORK ZONES)
-- ============================================================================

-- Template for creating a geomarker
-- Replace the placeholders with actual values

INSERT INTO geomarkers (
  project_id,           -- UUID from projects table
  geomarker_type,       -- 'work_zone', 'protected_zone', 'buffer_zone'
  source_type,          -- 'manual', 'government', 'satellite', 'cadastral'
  source_note,          -- Description of data source
  version,              -- Start with 1
  is_active,            -- true for current boundary
  geojson               -- GeoJSON Feature with Polygon geometry
) VALUES (
  'YOUR-PROJECT-UUID-HERE',
  'work_zone',
  'government',
  'Derived from official project documentation',
  1,
  true,
  '{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-100.35, 25.75],
        [-100.30, 25.75],
        [-100.30, 25.70],
        [-100.35, 25.70],
        [-100.35, 25.75]
      ]]
    },
    "properties": {
      "name": "Project Work Zone",
      "area_hectares": 245
    }
  }'::jsonb
);


-- ============================================================================
-- EXAMPLE: Complete Project with Geomarker - TREN MAYA TRAMO 5
-- ============================================================================

-- 1. Get company and region IDs (replace with your actual UUIDs)
-- SELECT id FROM companies WHERE name = 'Grupo México Proyectos';
-- SELECT id FROM regions WHERE name = 'Quintana Roo';

-- 2. Project created via API (see seed_projects.py)
-- You'll get back a project_id, use it below

-- 3. Create geomarker for Tren Maya Tramo 5
INSERT INTO geomarkers (
  project_id,
  geomarker_type,
  source_type,
  source_note,
  version,
  is_active,
  geojson
) VALUES (
  'YOUR-TREN-MAYA-PROJECT-UUID',  -- Replace with actual project UUID
  'work_zone',
  'government',
  'Derived from FONATUR official Tren Maya route maps and environmental impact assessment',
  1,
  true,
  '{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-87.10, 20.85],
        [-86.95, 20.75],
        [-86.85, 20.65],
        [-86.78, 20.55],
        [-86.72, 20.45],
        [-86.68, 20.35],
        [-86.64, 20.25],
        [-86.62, 20.15],
        [-86.66, 20.15],
        [-86.70, 20.25],
        [-86.75, 20.35],
        [-86.80, 20.45],
        [-86.88, 20.55],
        [-86.98, 20.65],
        [-87.05, 20.75],
        [-87.12, 20.85],
        [-87.10, 20.85]
      ]]
    },
    "properties": {
      "name": "Tren Maya - Tramo 5 Work Corridor",
      "area_hectares": 2890,
      "length_km": 121,
      "route": "Cancún International Airport to Tulum"
    }
  }'::jsonb
);


-- ============================================================================
-- EXAMPLE: Complete Project - DOS BOCAS REFINERY
-- ============================================================================

-- Get IDs
-- SELECT id FROM companies WHERE name = 'Pemex';
-- SELECT id FROM regions WHERE name = 'Tabasco';

-- Create geomarker
INSERT INTO geomarkers (
  project_id,
  geomarker_type,
  source_type,
  source_note,
  version,
  is_active,
  geojson
) VALUES (
  'YOUR-DOS-BOCAS-PROJECT-UUID',  -- Replace with actual project UUID
  'work_zone',
  'government',
  'Derived from Pemex official site plans and environmental permits',
  1,
  true,
  '{
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
        [-93.23, 18.43],
        [-93.20, 18.43],
        [-93.20, 18.40],
        [-93.23, 18.40],
        [-93.23, 18.43]
      ]]
    },
    "properties": {
      "name": "Refinería Dos Bocas Site",
      "area_hectares": 595,
      "capacity_barrels_per_day": 340000,
      "location": "Paraíso, Tabasco"
    }
  }'::jsonb
);


-- ============================================================================
-- UTILITY QUERIES
-- ============================================================================

-- List all projects with their relationships
SELECT 
  p.id,
  p.name AS project_name,
  p.status,
  p.risk_label,
  c.name AS company_name,
  r.name AS region_name,
  p.monitoring_start_date,
  p.monitoring_end_date,
  p.created_at
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN regions r ON p.region_id = r.id
ORDER BY p.created_at DESC;


-- List all geomarkers with project names
SELECT 
  g.id,
  p.name AS project_name,
  g.geomarker_type,
  g.source_type,
  g.version,
  g.is_active,
  g.geojson->'properties'->>'area_hectares' AS area_hectares,
  g.created_at
FROM geomarkers g
JOIN projects p ON g.project_id = p.id
ORDER BY g.created_at DESC;


-- Get all companies with project counts
SELECT 
  c.id,
  c.name,
  c.website,
  COUNT(p.id) AS project_count
FROM companies c
LEFT JOIN projects p ON c.id = p.company_id
GROUP BY c.id, c.name, c.website
ORDER BY project_count DESC;


-- Get all regions with project counts
SELECT 
  r.id,
  r.name,
  r.country_code,
  r.admin_level,
  COUNT(p.id) AS project_count
FROM regions r
LEFT JOIN projects p ON r.region_id = p.id
GROUP BY r.id, r.name, r.country_code, r.admin_level
ORDER BY project_count DESC;


-- Find projects without geomarkers
SELECT 
  p.id,
  p.name,
  p.status
FROM projects p
LEFT JOIN geomarkers g ON p.id = g.project_id AND g.is_active = true
WHERE g.id IS NULL;


-- Find projects without company or region
SELECT 
  p.id,
  p.name,
  CASE WHEN p.company_id IS NULL THEN 'Missing' ELSE 'OK' END AS company_status,
  CASE WHEN p.region_id IS NULL THEN 'Missing' ELSE 'OK' END AS region_status
FROM projects p
WHERE p.company_id IS NULL OR p.region_id IS NULL;


-- Update project risk label
-- UPDATE projects 
-- SET risk_label = 'high' 
-- WHERE id = 'YOUR-PROJECT-UUID';


-- Delete a geomarker (careful!)
-- DELETE FROM geomarkers WHERE id = 'YOUR-GEOMARKER-UUID';


-- Delete a project (careful! This will cascade delete related records)
-- DELETE FROM projects WHERE id = 'YOUR-PROJECT-UUID';


-- ============================================================================
-- COORDINATE REFERENCE
-- ============================================================================
-- Mexico bounds: 
--   Longitude: -118.4 to -86.7
--   Latitude: 14.5 to 32.7
--
-- Major cities (approximate centers):
--   México City: [-99.13, 19.43]
--   Guadalajara: [-103.35, 20.67]
--   Monterrey: [-100.31, 25.68]
--   Cancún: [-86.85, 21.16]
--   Tijuana: [-117.04, 32.52]
--   Mérida: [-89.59, 20.97]
--   Puebla: [-98.20, 19.04]
--   Veracruz: [-96.13, 19.17]
--
-- Remember: GeoJSON coordinates are [longitude, latitude] (not lat, lng!)
-- ============================================================================
