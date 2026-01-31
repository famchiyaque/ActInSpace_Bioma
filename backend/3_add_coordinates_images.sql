-- ============================================================================
-- Add center coordinates and image fields to projects table
-- ============================================================================

-- Add center_lat and center_lng columns for map marker placement
ALTER TABLE projects 
ADD COLUMN center_lat NUMERIC(10, 7),
ADD COLUMN center_lng NUMERIC(10, 7),
ADD COLUMN image_url TEXT;

-- Update existing projects with center coordinates
-- Based on real locations of these Mexican infrastructure projects

-- 1. Tren Maya - Tramo 5 Sur (Playa del Carmen - Tulum)
-- Location: Midpoint between Playa del Carmen and Tulum
UPDATE projects 
SET center_lat = 20.5000,
    center_lng = -87.0000,
    image_url = 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600'
WHERE name = 'Tren Maya - Tramo 5 Sur (Playa del Carmen - Tulum)';

-- 2. Refinería Olmeca (Dos Bocas)
-- Location: Paraíso, Tabasco
UPDATE projects 
SET center_lat = 18.3850,
    center_lng = -93.8400,
    image_url = 'https://images.unsplash.com/photo-1581093458791-9d42e3c95e1d?w=600'
WHERE name = 'Refinería Olmeca';

-- 3. Aeropuerto Internacional Felipe Ángeles (AIFA)
-- Location: Zumpango, Estado de México
UPDATE projects 
SET center_lat = 19.7600,
    center_lng = -99.0100,
    image_url = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600'
WHERE name = 'Aeropuerto Internacional Felipe Ángeles';

-- 4. Corredor Interoceánico del Istmo de Tehuantepec
-- Location: Midpoint between Salina Cruz and Coatzacoalcos
UPDATE projects 
SET center_lat = 16.8000,
    center_lng = -94.6500,
    image_url = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
WHERE name = 'Corredor Interoceánico del Istmo de Tehuantepec';

-- 5. Ampliación del Puerto de Veracruz
-- Location: Port of Veracruz
UPDATE projects 
SET center_lat = 19.2200,
    center_lng = -96.0200,
    image_url = 'https://images.unsplash.com/photo-1605880329287-8f5e39bd04f8?w=600'
WHERE name = 'Ampliación del Puerto de Veracruz';

-- Verify the updates
SELECT 
  name, 
  center_lat, 
  center_lng,
  CASE 
    WHEN image_url IS NOT NULL THEN 'Has image'
    ELSE 'No image'
  END as image_status
FROM projects
ORDER BY name;
