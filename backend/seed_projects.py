#!/usr/bin/env python3
"""
Script to seed projects into Bioma database via API

Usage:
    python seed_projects.py

Make sure:
1. Backend is running (uvicorn main:app --reload --port 8000)
2. You have company_id and region_id from Supabase
3. Update the PROJECT_DATA list below with your real projects
"""

import requests
import json
from typing import Optional

# Configuration
API_BASE_URL = "http://localhost:8000"

# Color codes for terminal output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


def create_project(
    name: str,
    description: str,
    region_id: Optional[str] = None,
    company_id: Optional[str] = None,
    status: str = "active",
    monitoring_start_date: Optional[str] = None,
    monitoring_end_date: Optional[str] = None
):
    """Create a project via API"""
    
    payload = {
        "name": name,
        "description": description,
        "status": status
    }
    
    # Add optional fields if provided
    if region_id:
        payload["region_id"] = region_id
    if company_id:
        payload["company_id"] = company_id
    if monitoring_start_date:
        payload["monitoring_start_date"] = monitoring_start_date
    if monitoring_end_date:
        payload["monitoring_end_date"] = monitoring_end_date
    
    try:
        print(f"{BLUE}Creating project: {name}...{RESET}")
        response = requests.post(
            f"{API_BASE_URL}/projects",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        
        project_data = response.json()
        print(f"{GREEN}✓ Project created successfully!{RESET}")
        print(f"  ID: {project_data['id']}")
        print(f"  Name: {project_data['name']}")
        print(f"  Status: {project_data['status']}")
        print()
        
        return project_data
        
    except requests.exceptions.ConnectionError:
        print(f"{RED}✗ ERROR: Cannot connect to API at {API_BASE_URL}{RESET}")
        print(f"{YELLOW}  Make sure backend is running: uvicorn main:app --reload --port 8000{RESET}")
        return None
        
    except requests.exceptions.HTTPError as e:
        print(f"{RED}✗ ERROR: API returned error status{RESET}")
        print(f"  Status Code: {response.status_code}")
        print(f"  Response: {response.text}")
        return None
        
    except Exception as e:
        print(f"{RED}✗ ERROR: {str(e)}{RESET}")
        return None


def list_projects():
    """List all projects"""
    try:
        print(f"{BLUE}Fetching all projects...{RESET}")
        response = requests.get(f"{API_BASE_URL}/projects")
        response.raise_for_status()
        
        data = response.json()
        projects = data.get("projects", [])
        
        print(f"{GREEN}✓ Found {len(projects)} projects{RESET}")
        for project in projects:
            print(f"  - {project['name']} (ID: {project['id']}, Status: {project['status']})")
        print()
        
        return projects
        
    except Exception as e:
        print(f"{RED}✗ ERROR: {str(e)}{RESET}")
        return []


# ============================================================================
# PROJECT DATA - UPDATE THIS WITH YOUR REAL PROJECTS
# ============================================================================

# IMPORTANT: First create companies and regions in Supabase, then add their UUIDs here

# Example companies (create these in Supabase first):
COMPANIES = {
    "grupo_mexico": None,  # Replace with actual UUID from Supabase
    "pemex": None,         # Replace with actual UUID from Supabase
    "fonatur": None,       # Replace with actual UUID from Supabase
}

# Example regions (create these in Supabase first):
REGIONS = {
    "quintana_roo": None,  # Replace with actual UUID from Supabase
    "tabasco": None,       # Replace with actual UUID from Supabase
    "nuevo_leon": None,    # Replace with actual UUID from Supabase
}

# Project data to seed
PROJECT_DATA = [
    {
        "name": "Tren Maya - Tramo 5 (Cancún - Tulum)",
        "description": "Railway construction project connecting Cancún airport to Tulum, part of the larger Tren Maya megaproject. 121km section crossing protected jungle areas and archaeological zones.",
        "region_id": REGIONS["quintana_roo"],
        "company_id": COMPANIES["grupo_mexico"],
        "status": "active",
        "monitoring_start_date": "2020-06-01",
        "monitoring_end_date": "2024-12-01",
        "geomarker": {
            "type": "Polygon",
            "coordinates": [[
                [-87.1, 20.85],
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
                [-87.1, 20.85]
            ]],
            "properties": {
                "area_hectares": 2890
            }
        }
    },
    {
        "name": "Refinería Dos Bocas",
        "description": "Major oil refinery construction project in Paraíso, Tabasco. One of the largest infrastructure projects in Mexico with capacity for 340,000 barrels per day.",
        "region_id": REGIONS["tabasco"],
        "company_id": COMPANIES["pemex"],
        "status": "active",
        "monitoring_start_date": "2019-06-02",
        "monitoring_end_date": "2024-07-01",
        "geomarker": {
            "type": "Polygon",
            "coordinates": [[
                [-93.23, 18.43],
                [-93.20, 18.43],
                [-93.20, 18.40],
                [-93.23, 18.40],
                [-93.23, 18.43]
            ]],
            "properties": {
                "area_hectares": 595
            }
        }
    },
    # Add more projects here...
]


def seed_all_projects():
    """Seed all projects from PROJECT_DATA"""
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}  BIOMA PROJECT SEEDING SCRIPT{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Check if UUIDs are configured
    if all(v is None for v in COMPANIES.values()):
        print(f"{YELLOW}⚠ WARNING: No company UUIDs configured!{RESET}")
        print(f"  Update COMPANIES dictionary with UUIDs from Supabase\n")
    
    if all(v is None for v in REGIONS.values()):
        print(f"{YELLOW}⚠ WARNING: No region UUIDs configured!{RESET}")
        print(f"  Update REGIONS dictionary with UUIDs from Supabase\n")
    
    # Seed projects
    created_projects = []
    failed_projects = []
    
    for project_data in PROJECT_DATA:
        # Extract geomarker for later (API doesn't handle it yet)
        geomarker = project_data.pop("geomarker", None)
        
        # Create project
        result = create_project(**project_data)
        
        if result:
            created_projects.append(result)
            if geomarker:
                print(f"{YELLOW}  NOTE: Geomarker needs to be added via Supabase SQL{RESET}")
                print(f"  Use project_id: {result['id']}\n")
        else:
            failed_projects.append(project_data["name"])
    
    # Summary
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{GREEN}✓ Successfully created: {len(created_projects)} projects{RESET}")
    if failed_projects:
        print(f"{RED}✗ Failed: {len(failed_projects)} projects{RESET}")
        for name in failed_projects:
            print(f"  - {name}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # List all projects
    if created_projects:
        print(f"\n{BLUE}All projects in database:{RESET}\n")
        list_projects()
    
    return created_projects


if __name__ == "__main__":
    # Test connection first
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        if response.status_code == 200:
            print(f"{GREEN}✓ Backend is running at {API_BASE_URL}{RESET}\n")
        else:
            print(f"{YELLOW}⚠ Backend responded but health check failed{RESET}\n")
    except:
        print(f"{RED}✗ Cannot connect to backend at {API_BASE_URL}{RESET}")
        print(f"{YELLOW}  Start it with: cd backend && uvicorn main:app --reload --port 8000{RESET}\n")
        exit(1)
    
    # Run seeding
    seed_all_projects()
    
    print(f"\n{BLUE}NEXT STEPS:{RESET}")
    print(f"1. Add geomarkers via Supabase SQL (see SEEDING_GUIDE.md)")
    print(f"2. Verify projects: curl http://localhost:8000/projects")
    print(f"3. Check frontend map to see your projects!\n")
