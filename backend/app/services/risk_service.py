from app.schemas.projects import RiskMapResponse, RiskProject

def get_risk_map(region_id: str | None, company_id: str | None) -> RiskMapResponse:
    projects = [
        RiskProject(
            project_id="demo-project",
            name="Demo Road Expansion",
            risk_label="high",
            risk_score=0.86,
            geometry=None,
        )
    ]
    return RiskMapResponse(projects=projects)
