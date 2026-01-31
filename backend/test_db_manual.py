#!/usr/bin/env python3
"""Quick manual database testing script"""

import asyncio
from app.config import settings
from app.db.session import supabase, get_db
from app.db.queries import ProjectQueries


async def test_connection():
    """Test basic connection to Supabase"""
    print("🔌 Testing Supabase connection...")
    try:
        db = get_db()
        print(f"✓ Connected to: {settings.supabase_url}")
        return db
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return None


async def test_project_operations():
    """Test project CRUD operations"""
    print("\n📦 Testing Project Operations...")
    
    try:
        # Test GET all projects
        print("  → Fetching all projects...")
        projects = await ProjectQueries.get_all()
        print(f"  ✓ Found {len(projects)} projects")
        
        # Test CREATE
        print("  → Creating test project...")
        test_project = await ProjectQueries.create({
            "name": "DB Test Project",
            "description": "Automated test"
        })
        project_id = test_project["id"]
        print(f"  ✓ Created project: {project_id}")
        
        # Test GET by ID
        print("  → Fetching project by ID...")
        fetched = await ProjectQueries.get_by_id(project_id)
        print(f"  ✓ Fetched: {fetched['name']}")
        
        # Test UPDATE
        print("  → Updating project...")
        updated = await ProjectQueries.update(project_id, {
            "description": "Updated description"
        })
        print(f"  ✓ Updated project")
        
        # Test DELETE
        print("  → Deleting test project...")
        await ProjectQueries.delete(project_id)
        print(f"  ✓ Deleted project")
        
    except Exception as e:
        print(f"  ✗ Error: {e}")


async def main():
    """Run all tests"""
    print("=" * 50)
    print("🧪 Database Testing Suite")
    print("=" * 50)
    
    db = await test_connection()
    if db:
        await test_project_operations()
    
    print("\n" + "=" * 50)
    print("✓ Testing complete!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
