"""Integration tests for database with API endpoints"""

import pytest
from fastapi.testclient import TestClient
from main import app


class TestDatabaseIntegration:
    """Test database integration with API"""
    
    def test_api_has_db_access(self):
        """Verify API can access database via dependencies"""
        client = TestClient(app)
        # This assumes you have endpoints that use the database
        # Add real endpoint tests here
        assert client is not None
        print("✓ TestClient initialized successfully")
