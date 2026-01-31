-- Run this in Supabase SQL Editor to create geomarkers

-- Geomarker for: Tren Maya - Tramo 5 Sur (Playa del Carmen - Tulum)
INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  '8b490443-f462-4bf4-baf7-f1b7255f10ae',
  'work_zone',
  'government',
  'Deforestation, cave collapse risk, and documented damage to cenotes during construction. Near Sistema de Cenotes Sac Actun, Sian Ka'an Biosphere Reserve',
  1,
  true,
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-87.15, 20.7], [-87.0, 20.65], [-86.85, 20.55], [-86.75, 20.45], [-86.7, 20.35], [-86.8, 20.3], [-86.95, 20.4], [-87.1, 20.55], [-87.15, 20.7]]]},"properties":{"area_hectares":3200}}'::jsonb
);

-- Geomarker for: Refinería Olmeca
INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  'c9974017-0111-43fe-8d46-97aabe36266f',
  'work_zone',
  'government',
  'Wetland loss, flooding risk, and mitigation challenges during construction. Near coastal wetlands of Paraíso',
  1,
  true,
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-93.88, 18.41], [-93.84, 18.41], [-93.8, 18.39], [-93.8, 18.36], [-93.84, 18.35], [-93.88, 18.36], [-93.88, 18.41]]]},"properties":{"area_hectares":566}}'::jsonb
);

-- Geomarker for: Aeropuerto Internacional Felipe Ángeles
INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  'fc69eb54-6a89-47f1-bc4e-243a112e5399',
  'work_zone',
  'government',
  'Environmental impact managed within approved mitigation plans',
  1,
  true,
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-99.05, 19.8], [-98.98, 19.8], [-98.94, 19.76], [-98.95, 19.72], [-99.02, 19.72], [-99.06, 19.75], [-99.05, 19.8]]]},"properties":{"area_hectares":2331}}'::jsonb
);

-- Geomarker for: Corredor Interoceánico del Istmo de Tehuantepec
INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  '477fb2dd-17c3-4e6b-93bc-cfdb1ed2a8ce',
  'work_zone',
  'government',
  'Impacts on biodiversity corridors and indigenous land rights. Near Selva Zoque, Chimalapas region',
  1,
  true,
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-95.2, 16.2], [-95.0, 16.3], [-94.5, 16.6], [-94.1, 17.0], [-94.0, 17.4], [-94.2, 17.6], [-94.8, 17.3], [-95.1, 16.8], [-95.2, 16.2]]]},"properties":{"area_hectares":12000}}'::jsonb
);

-- Geomarker for: Ampliación del Puerto de Veracruz
INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  '254cc441-06c2-43db-aa67-c54b045fff0e',
  'work_zone',
  'government',
  'Dredging impacts on coral reefs and marine sedimentation. Near Sistema Arrecifal Veracruzano National Park',
  1,
  true,
  '{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-96.08, 19.24], [-96.02, 19.26], [-95.96, 19.25], [-95.95, 19.22], [-96.0, 19.2], [-96.06, 19.21], [-96.08, 19.24]]]},"properties":{"area_hectares":1000}}'::jsonb
);

