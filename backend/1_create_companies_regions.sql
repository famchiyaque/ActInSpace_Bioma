-- ============================================================================
-- STEP 1: Create Companies - Run this in Supabase SQL Editor
-- ============================================================================

-- Check if companies already exist
SELECT id, name FROM companies WHERE name IN (
  'SEDENA / FONATUR',
  'PEMEX',
  'SEDENA',
  'CIIT (Gobierno de México)',
  'ASIPONA Veracruz'
);

-- If no results above, run this insert:
INSERT INTO companies (name, website, description) 
VALUES 
  ('SEDENA / FONATUR', 'https://www.gob.mx/trenmaya', 'Mexican Army and Tourism Development Fund - Tren Maya project'),
  ('PEMEX', 'https://www.pemex.com', 'Mexican state-owned petroleum company'),
  ('SEDENA', 'https://www.gob.mx/aifa', 'Mexican Secretariat of National Defense - AIFA airport'),
  ('CIIT (Gobierno de México)', 'https://www.gob.mx/ciit', 'Interoceanic Corridor of the Isthmus of Tehuantepec'),
  ('ASIPONA Veracruz', 'https://www.puertoveracruz.com.mx', 'Port of Veracruz administration')
RETURNING id, name;

-- ============================================================================
-- STEP 2: Create Regions
-- ============================================================================

-- Check if regions already exist
SELECT id, name FROM regions WHERE name IN (
  'Quintana Roo',
  'Tabasco',
  'Estado de México',
  'Oaxaca',
  'Veracruz'
);

-- If no results above, run this insert:
INSERT INTO regions (name, country_code, admin_level) 
VALUES 
  ('Quintana Roo', 'MX', 'state'),
  ('Tabasco', 'MX', 'state'),
  ('Estado de México', 'MX', 'state'),
  ('Oaxaca', 'MX', 'state'),
  ('Veracruz', 'MX', 'state')
RETURNING id, name;

-- ============================================================================
-- STEP 3: Get the IDs (if you didn't save them above)
-- ============================================================================

-- Get company IDs
SELECT id, name FROM companies WHERE name IN (
  'SEDENA / FONATUR',
  'PEMEX',
  'SEDENA',
  'CIIT (Gobierno de México)',
  'ASIPONA Veracruz'
) ORDER BY name;

-- Get region IDs
SELECT id, name FROM regions WHERE name IN (
  'Quintana Roo',
  'Tabasco',
  'Estado de México',
  'Oaxaca',
  'Veracruz'
) ORDER BY name;
