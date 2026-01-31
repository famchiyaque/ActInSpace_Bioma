"""Test new API endpoints"""

import requests
import json
from datetime import date, datetime

BASE_URL = "http://127.0.0.1:8000"


def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing /health")
    response = requests.get(f"{BASE_URL}/health")
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("  ✓ Health check passed")


def test_list_projects():
    """Test GET /projects"""
    print("\n📋 Testing GET /projects")
    response = requests.get(f"{BASE_URL}/projects")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  Found {len(data['projects'])} projects")
        if data['projects']:
            print(f"  First project: {data['projects'][0]['name']}")
            print(f"    Risk: {data['projects'][0]['risk_label']}")
            print(f"    Status: {data['projects'][0]['status']}")
        print("  ✓ Projects list retrieved")
    else:
        print(f"  Response: {response.text}")


def test_project_detail():
    """Test GET /projects/{id}"""
    print("\n📊 Testing GET /projects/{id}")
    
    # First get a project ID
    list_response = requests.get(f"{BASE_URL}/projects")
    if list_response.status_code == 200:
        projects = list_response.json()["projects"]
        if projects:
            project_id = projects[0]["id"]
            print(f"  Testing with project: {project_id}")
            
            response = requests.get(f"{BASE_URL}/projects/{project_id}")
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  Project: {data['project']['name']}")
                print(f"  Geomarkers history: {len(data['geomarkers']['history'])}")
                print(f"  Run history: {len(data['run_history'])}")
                print(f"  Latest run: {data['latest_run'] is not None}")
                print("  ✓ Project detail retrieved")
            else:
                print(f"  Response: {response.text}")
        else:
            print("  ⚠ No projects to test with")
    else:
        print("  ⚠ Could not get project list")


def test_create_run():
    """Test POST /projects/{id}/runs"""
    print("\n🔧 Testing POST /projects/{id}/runs")
    
    # Get a project and geomarker
    list_response = requests.get(f"{BASE_URL}/projects")
    if list_response.status_code == 200:
        projects = list_response.json()["projects"]
        if projects and projects[0].get("active_geomarker"):
            project_id = projects[0]["id"]
            geomarker_id = projects[0]["active_geomarker"]["id"]
            
            print(f"  Creating run for project: {project_id}")
            
            run_data = {
                "geomarker_id": geomarker_id,
                "start_date": "2026-01-01",
                "end_date": "2026-01-28",
                "cadence": "weekly",
                "method": "ndvi",
                "cloud_threshold": 30,
                "parameters": {"test": True}
            }
            
            response = requests.post(
                f"{BASE_URL}/projects/{project_id}/runs",
                json=run_data
            )
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 201:
                data = response.json()
                print(f"  Created run: {data['run_id']}")
                print(f"  Status: {data['status']}")
                print("  ✓ Run created successfully")
                return data['run_id']
            else:
                print(f"  Response: {response.text}")
        else:
            print("  ⚠ No project with geomarker to test with")
    else:
        print("  ⚠ Could not get project list")
    
    return None


def test_get_run(run_id=None):
    """Test GET /runs/{id}"""
    print("\n🏃 Testing GET /runs/{id}")
    
    if not run_id:
        print("  ⚠ No run_id provided, skipping")
        return
    
    response = requests.get(f"{BASE_URL}/runs/{run_id}")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  Run ID: {data['id']}")
        print(f"  Status: {data['status']}")
        print(f"  Method: {data['method']}")
        print("  ✓ Run details retrieved")
    else:
        print(f"  Response: {response.text}")


def test_get_run_reports(run_id=None):
    """Test GET /runs/{id}/reports"""
    print("\n📄 Testing GET /runs/{id}/reports")
    
    if not run_id:
        print("  ⚠ No run_id provided, skipping")
        return
    
    response = requests.get(f"{BASE_URL}/runs/{run_id}/reports")
    print(f"  Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"  Reports count: {len(data['reports'])}")
        print("  ✓ Reports retrieved")
    else:
        print(f"  Response: {response.text}")


def test_docs():
    """Test API documentation"""
    print("\n📚 Testing /docs")
    response = requests.get(f"{BASE_URL}/docs")
    print(f"  Status: {response.status_code}")
    assert response.status_code == 200
    print("  ✓ API docs accessible")


def main():
    print("=" * 60)
    print("🧪 API Endpoint Testing Suite")
    print("=" * 60)
    
    try:
        test_health()
        test_docs()
        test_list_projects()
        test_project_detail()
        run_id = test_create_run()
        test_get_run(run_id)
        test_get_run_reports(run_id)
        
        print("\n" + "=" * 60)
        print("✅ All tests completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
