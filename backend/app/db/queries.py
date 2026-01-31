"""Database query functions"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.session import supabase


class ProjectQueries:
    @staticmethod
    def get_all_with_relations() -> List[Dict[Any, Any]]:
        """Fetch all projects with company and region"""
        response = supabase.table("projects").select(
            "*, company:companies(*), region:regions(*)"
        ).execute()
        return response.data

    @staticmethod
    def get_by_id(project_id: str) -> Optional[Dict[Any, Any]]:
        """Fetch project by ID with relations"""
        response = supabase.table("projects").select(
            "*, company:companies(*), region:regions(*)"
        ).eq("id", project_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[Any, Any]:
        """Create a new project"""
        response = supabase.table("projects").insert(data).execute()
        return response.data[0]

    @staticmethod
    def update(project_id: str, data: Dict[str, Any]) -> Dict[Any, Any]:
        """Update a project"""
        response = supabase.table("projects").update(data).eq("id", project_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def delete(project_id: str) -> None:
        """Delete a project"""
        supabase.table("projects").delete().eq("id", project_id).execute()


class GeomarkerQueries:
    @staticmethod
    def get_active_for_project(project_id: str) -> Optional[Dict[Any, Any]]:
        """Get active geomarker with highest version for project"""
        response = supabase.table("geomarkers").select("*").eq(
            "project_id", project_id
        ).eq("is_active", True).order("version", desc=True).limit(1).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def get_history_for_project(project_id: str) -> List[Dict[Any, Any]]:
        """Get geomarker history for project"""
        response = supabase.table("geomarkers").select(
            "id, version, geomarker_type, source_type, is_active, created_at"
        ).eq("project_id", project_id).order("created_at", desc=True).execute()
        return response.data

    @staticmethod
    def get_by_id(geomarker_id: str) -> Optional[Dict[Any, Any]]:
        """Get geomarker by ID"""
        response = supabase.table("geomarkers").select("*").eq("id", geomarker_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[Any, Any]:
        """Create a new geomarker"""
        response = supabase.table("geomarkers").insert(data).execute()
        return response.data[0]


class RunQueries:
    @staticmethod
    def get_last_completed_for_project(project_id: str) -> Optional[Dict[Any, Any]]:
        """Get last completed run for project"""
        response = supabase.table("runs").select("*").eq(
            "project_id", project_id
        ).eq("status", "completed").order("end_date", desc=True).limit(1).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def get_history_for_project(project_id: str, limit: int = 10) -> List[Dict[Any, Any]]:
        """Get run history for project"""
        response = supabase.table("runs").select(
            "id, end_date, hectares_change, status"
        ).eq("project_id", project_id).order("end_date", desc=True).limit(limit).execute()
        return response.data

    @staticmethod
    def get_by_id(run_id: str) -> Optional[Dict[Any, Any]]:
        """Get run by ID"""
        response = supabase.table("runs").select("*").eq("id", run_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[Any, Any]:
        """Create a new run"""
        response = supabase.table("runs").insert(data).execute()
        return response.data[0]

    @staticmethod
    def update(run_id: str, data: Dict[str, Any]) -> Dict[Any, Any]:
        """Update a run"""
        response = supabase.table("runs").update(data).eq("id", run_id).execute()
        return response.data[0] if response.data else None


class ReportQueries:
    @staticmethod
    def get_by_run_id(run_id: str) -> List[Dict[Any, Any]]:
        """Get all reports for a run"""
        response = supabase.table("reports").select("*").eq("run_id", run_id).execute()
        return response.data

    @staticmethod
    def create(data: Dict[str, Any]) -> Dict[Any, Any]:
        """Create a new report"""
        response = supabase.table("reports").insert(data).execute()
        return response.data[0]

    @staticmethod
    def create_many(data: List[Dict[str, Any]]) -> List[Dict[Any, Any]]:
        """Create multiple reports"""
        response = supabase.table("reports").insert(data).execute()
        return response.data
