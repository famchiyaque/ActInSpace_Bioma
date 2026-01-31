# Data Request: Mexican Infrastructure Projects

I need detailed information about major construction/infrastructure projects in Mexico. For each project, provide:

## Required Fields

**Basic Info:**
- Project official name (Spanish)
- Category: Infraestructura | Transporte | Desarrollo Urbano | Medio Ambiente | Turismo
- State and municipality
- Description (2-3 sentences max)

**Timeline:**
- Start date (YYYY-MM-DD format)
- End date (YYYY-MM-DD format)  
- Status: active | completed | paused | cancelled

**Company & Location:**
- Developer/company name
- Company website (if available)
- Government level: federal | state | municipal

**Geographic Data:**
- Project area in hectares
- 4-8 coordinate points forming a polygon around the project site
  - Format: [longitude, latitude] pairs
  - Mexico bounds: lng -118.4 to -86.7, lat 14.5 to 32.7

**Environmental:**
- Compliance status: compliant | warning | violation
- Any environmental concerns or violations (1 sentence)
- Protected areas nearby (if any)

## Priority Projects

Focus on these high-profile projects:
1. Tren Maya (sections 1-7)
2. Refinería Dos Bocas (Tabasco)
3. AIFA Airport (Estado de México)
4. Corredor Interoceánico (Oaxaca-Veracruz)
5. Puerto de Veracruz expansion
6. Metro CDMX extensions
7. Major highway projects

## Output Format

Please provide as JSON array:

```json
[
  {
    "name": "Tren Maya - Tramo 5 (Cancún - Tulum)",
    "category": "Transporte",
    "state": "Quintana Roo",
    "municipality": "Solidaridad, Tulum",
    "description": "Railway connecting Cancún airport to Tulum, 121km section through jungle and archaeological areas.",
    "start_date": "2020-06-01",
    "end_date": "2024-12-01",
    "status": "active",
    "company_name": "Grupo México / FONATUR",
    "company_website": "https://www.fonatur.gob.mx",
    "government_level": "federal",
    "area_hectares": 2890,
    "coordinates": [
      [-87.10, 20.85],
      [-86.95, 20.75],
      [-86.85, 20.65],
      [-86.78, 20.55],
      [-86.72, 20.45],
      [-86.68, 20.35],
      [-86.64, 20.25],
      [-86.62, 20.15],
      [-86.70, 20.25],
      [-86.80, 20.45],
      [-87.05, 20.75],
      [-87.10, 20.85]
    ],
    "compliance": "violation",
    "environmental_concerns": "Deforestation of jungle, impact on cenotes and underground rivers, route changes through protected areas",
    "protected_areas": "Near Sian Ka'an Biosphere Reserve"
  }
]
```

Provide 5-10 projects in valid JSON format.
