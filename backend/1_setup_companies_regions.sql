-- ============================================================================
-- STEP 1: Create Companies
-- Run this in Supabase SQL Editor first
-- ============================================================================

INSERT INTO companies (name, website, description) 
VALUES 
  ('SEDENA / FONATUR', 'https://www.gob.mx/trenmaya', 'Mexican Army and Tourism Development Fund - Tren Maya project'),
  ('PEMEX', 'https://www.pemex.com', 'Mexican state-owned petroleum company'),
  ('SEDENA', 'https://www.gob.mx/aifa', 'Mexican Secretariat of National Defense - AIFA airport'),
  ('CIIT (Gobierno de México)', 'https://www.gob.mx/ciit', 'Interoceanic Corridor of the Isthmus of Tehuantepec'),
  ('ASIPONA Veracruz', 'https://www.puertoveracruz.com.mx', 'Port of Veracruz administration')
RETURNING id, name;

-- SAVE THE RETURNED IDs!

-- ============================================================================
-- STEP 2: Create Regions
-- ============================================================================

INSERT INTO regions (name, country_code, admin_level) 
VALUES 
  ('Quintana Roo', 'MX', 'state'),
  ('Tabasco', 'MX', 'state'),
  ('Estado de México', 'MX', 'state'),
  ('Oaxaca', 'MX', 'state'),
  ('Veracruz', 'MX', 'state')
RETURNING id, name;

-- SAVE THE RETURNED IDs!
