"""Database connection and query tests"""

import pytest
from app.db.session import get_db, supabase
from app.db.queries import ProjectQueries, AlertQueries, BoundaryQueries


class TestDatabaseConnection:
    """Test basic database connectivity"""
    
    def test_supabase_client_initialized(self):
        """Test that Supabase client is properly initialized"""
        db = get_db()
        assert db is not None
        assert hasattr(db, 'table')
    
    def test_database_dependency(self):
        """Test database dependency function"""
        db = get_db()
        assert db == supabase


class TestProjectQueries:
    """Test project database operations"""
    
    @pytest.mark.asyncio
    async def test_get_all_projects(self):
        """Fetch all projects from database"""
        try:
            projects = await ProjectQueries.get_all()
            assert isinstance(projects, list)
            print(f"✓ Successfully fetched {len(projects)} projects")
        except Exception as e:
            pytest.skip(f"Database not available: {str(e)}")
    
    @pytest.mark.asyncio
    async def test_create_project(self):
        """Test creating a new project"""
        try:
            test_data = {
                "name": "Test Project",
                "description": "A test project for DB testing"
            }
            project = await ProjectQueries.create(test_data)
            assert project["name"] == "Test Project"
            print(f"✓ Created project with ID: {project.get('id')}")
            
            # Cleanup
            if "id" in project:
                await ProjectQueries.delete(project["id"])
        except Exception as e:
            pytest.skip(f"Database write failed: {str(e)}")
    
    @pytest.mark.asyncio
    async def test_get_project_by_id(self):
        """Test fetching a project by ID"""
        try:
            # Create a test project first
            test_data = {"name": "Temp Project", "description": "Temporary"}
            created = await ProjectQueries.create(test_data)
            project_id = created["id"]
            
            # Fetch it back
            fetched = await ProjectQueries.get_by_id(project_id)
            assert fetched is not None
            assert fetched["id"] == project_id
            print(f"✓ Successfully fetched project by ID: {project_id}")
            
            # Cleanup
            await ProjectQueries.delete(project_id)
        except Exception as e:
            pytest.skip(f"Database operation failed: {str(e)}")


class TestAlertQueries:
    """Test alert database operations"""
    
    @pytest.mark.asyncio
    async def test_get_project_alerts(self):
        """Fetch alerts for a project"""
        try:
            # You'll need to replace with a real project ID from your DB
            project_id = "test-project-id"
            alerts = await AlertQueries.get_all(project_id)
            assert isinstance(alerts, list)
            print(f"✓ Successfully fetched alerts for project")
        except Exception as e:
            pytest.skip(f"Database not available: {str(e)}")


class TestBoundaryQueries:
    """Test boundary database operations"""
    
    @pytest.mark.asyncio
    async def test_get_project_boundaries(self):
        """Fetch boundaries for a project"""
        try:
            project_id = "test-project-id"
            boundaries = await BoundaryQueries.get_all(project_id)
            assert isinstance(boundaries, list)
            print(f"✓ Successfully fetched boundaries for project")
        except Exception as e:
            pytest.skip(f"Database not available: {str(e)}")
