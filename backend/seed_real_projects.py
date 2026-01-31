#!/usr/bin/env python3
"""
Seed the 5 Mexican infrastructure projects into Bioma database
This script will automatically look up company and region IDs
"""

import requests
import json
from supabase import create_client

API_BASE_URL = "http://localhost:8000"

# Supabase credentials
SUPABASE_URL = "https://dpftjteijqfsoqmpojyr.supabase.co"
SUPABASE_KEY = "sb_publishable_sug2Ed1k8a5-Tas3mbHycQ_DKzdlKde"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================================
# Project Data from ChatGPT
# ============================================================================

PROJECTS_DATA = [
    {
        "name": "Tren Maya - Tramo 5 Sur (Playa del Carmen - Tulum)",
        "description": "Railway section connecting Playa del Carmen to Tulum, rerouted inland after environmental opposition, crossing karst terrain with cenotes and underground rivers.",
        "company_name": "SEDENA / FONATUR",
        "region_name": "Quintana Roo",
        "status": "active",
        "monitoring_start_date": "2020-06-01",
        "monitoring_end_date": "2024-12-31",
        "geomarker": {
            "coordinates": [
                [-87.15, 20.70],
                [-87.00, 20.65],
                [-86.85, 20.55],
                [-86.75, 20.45],
                [-86.70, 20.35],
                [-86.80, 20.30],
                [-86.95, 20.40],
                [-87.10, 20.55],
                [-87.15, 20.70]
            ],
            "area_hectares": 3200,
            "source_note": "Deforestation, cave collapse risk, and documented damage to cenotes during construction. Near Sistema de Cenotes Sac Actun, Sian Ka'an Biosphere Reserve"
        }
    },
    {
        "name": "Refinería Olmeca",
        "description": "Large-scale oil refinery intended to increase national fuel production capacity, built on former mangrove and wetland areas.",
        "company_name": "PEMEX",
        "region_name": "Tabasco",
        "status": "active",
        "monitoring_start_date": "2019-08-01",
        "monitoring_end_date": "2025-06-30",
        "geomarker": {
            "coordinates": [
                [-93.88, 18.41],
                [-93.84, 18.41],
                [-93.80, 18.39],
                [-93.80, 18.36],
                [-93.84, 18.35],
                [-93.88, 18.36],
                [-93.88, 18.41]
            ],
            "area_hectares": 566,
            "source_note": "Wetland loss, flooding risk, and mitigation challenges during construction. Near coastal wetlands of Paraíso"
        }
    },
    {
        "name": "Aeropuerto Internacional Felipe Ángeles",
        "description": "International airport serving the Mexico City metropolitan area, built on a former military air base.",
        "company_name": "SEDENA",
        "region_name": "Estado de México",
        "status": "finished",
        "monitoring_start_date": "2019-10-01",
        "monitoring_end_date": "2022-03-21",
        "geomarker": {
            "coordinates": [
                [-99.05, 19.80],
                [-98.98, 19.80],
                [-98.94, 19.76],
                [-98.95, 19.72],
                [-99.02, 19.72],
                [-99.06, 19.75],
                [-99.05, 19.80]
            ],
            "area_hectares": 2331,
            "source_note": "Environmental impact managed within approved mitigation plans"
        }
    },
    {
        "name": "Corredor Interoceánico del Istmo de Tehuantepec",
        "description": "Multimodal logistics corridor linking Pacific and Gulf coasts through rail, ports, highways, and industrial parks.",
        "company_name": "CIIT (Gobierno de México)",
        "region_name": "Oaxaca",
        "status": "active",
        "monitoring_start_date": "2020-09-01",
        "monitoring_end_date": "2026-12-31",
        "geomarker": {
            "coordinates": [
                [-95.20, 16.20],
                [-95.00, 16.30],
                [-94.50, 16.60],
                [-94.10, 17.00],
                [-94.00, 17.40],
                [-94.20, 17.60],
                [-94.80, 17.30],
                [-95.10, 16.80],
                [-95.20, 16.20]
            ],
            "area_hectares": 12000,
            "source_note": "Impacts on biodiversity corridors and indigenous land rights. Near Selva Zoque, Chimalapas region"
        }
    },
    {
        "name": "Ampliación del Puerto de Veracruz",
        "description": "Expansion of port capacity through new terminals, dredging, and breakwater construction.",
        "company_name": "ASIPONA Veracruz",
        "region_name": "Veracruz",
        "status": "active",
        "monitoring_start_date": "2014-01-01",
        "monitoring_end_date": "2026-12-31",
        "geomarker": {
            "coordinates": [
                [-96.08, 19.24],
                [-96.02, 19.26],
                [-95.96, 19.25],
                [-95.95, 19.22],
                [-96.00, 19.20],
                [-96.06, 19.21],
                [-96.08, 19.24]
            ],
            "area_hectares": 1000,
            "source_note": "Dredging impacts on coral reefs and marine sedimentation. Near Sistema Arrecifal Veracruzano National Park"
        }
    }
]


def get_company_id(name):
    """Get company ID by name"""
    response = supabase.table("companies").select("id").eq("name", name).execute()
    if response.data:
        return response.data[0]["id"]
    return None


def get_region_id(name):
    """Get region ID by name"""
    response = supabase.table("regions").select("id").eq("name", name).execute()
    if response.data:
        return response.data[0]["id"]
    return None


def create_project(project_data):
    """Create a project via API"""
    geomarker = project_data.pop("geomarker")
    company_name = project_data.pop("company_name")
    region_name = project_data.pop("region_name")
    
    # Get IDs
    company_id = get_company_id(company_name)
    region_id = get_region_id(region_name)
    
    if not company_id:
        print(f"  ⚠ WARNING: Company '{company_name}' not found, creating without company")
    if not region_id:
        print(f"  ⚠ WARNING: Region '{region_name}' not found, creating without region")
    
    project_data["company_id"] = company_id
    project_data["region_id"] = region_id
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/projects",
            json=project_data,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        result = response.json()
        
        print(f"✓ Created: {result['name']}")
        print(f"  ID: {result['id']}")
        return result["id"], geomarker
        
    except Exception as e:
        print(f"✗ Failed: {project_data['name']}")
        print(f"  Error: {str(e)}")
        if hasattr(e, 'response'):
            print(f"  Response: {e.response.text if hasattr(e.response, 'text') else e.response}")
        return None, None


def create_geomarker_sql(project_id, geomarker):
    """Generate SQL for creating a geomarker"""
    coords_json = json.dumps([geomarker["coordinates"]])
    
    return f"""INSERT INTO geomarkers (project_id, geomarker_type, source_type, source_note, version, is_active, geojson)
VALUES (
  '{project_id}',
  'work_zone',
  'government',
  '{geomarker.get("source_note", "")}',
  1,
  true,
  '{{"type":"Feature","geometry":{{"type":"Polygon","coordinates":{coords_json}}},"properties":{{"area_hectares":{geomarker["area_hectares"]}}}}}'::jsonb
);
"""


def main():
    print("\n" + "="*60)
    print("  BIOMA PROJECT SEEDING - Real Mexican Projects")
    print("="*60 + "\n")
    
    # Test backend connection
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print("✓ Backend API is running\n")
        else:
            print("⚠ Backend health check failed\n")
    except:
        print("❌ Cannot connect to backend at", API_BASE_URL)
        print("   Make sure it's running: uvicorn main:app --reload --port 8000\n")
        return
    
    # Create projects
    print("Creating projects...\n")
    created = []
    
    for project in PROJECTS_DATA:
        project_id, geomarker = create_project(project.copy())
        if project_id:
            created.append({
                "project_id": project_id,
                "geomarker": geomarker,
                "name": project["name"]
            })
            print()
    
    print(f"{'='*60}")
    print(f"✓ Successfully created {len(created)}/{len(PROJECTS_DATA)} projects")
    print(f"{'='*60}\n")
    
    # Generate SQL for geomarkers
    if created:
        print("Generating SQL for geomarkers...\n")
        
        sql_content = "-- Run this in Supabase SQL Editor to create geomarkers\n\n"
        
        for item in created:
            sql_content += f"-- Geomarker for: {item['name']}\n"
            sql_content += create_geomarker_sql(item["project_id"], item["geomarker"])
            sql_content += "\n"
        
        # Save to file
        with open("2_create_geomarkers.sql", "w", encoding="utf-8") as f:
            f.write(sql_content)
        
        print(f"✓ SQL saved to: backend/2_create_geomarkers.sql")
        print(f"\nNext step: Run 2_create_geomarkers.sql in Supabase SQL Editor\n")
        
        # Also print first one as example
        print("Preview of geomarker SQL:\n")
        print(create_geomarker_sql(created[0]["project_id"], created[0]["geomarker"]))
    
    print("\n" + "="*60)
    print("  DONE! Check your map at http://localhost:5173")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
