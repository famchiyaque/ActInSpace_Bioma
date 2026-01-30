from fastapi import APIRouter

router = APIRouter(prefix="/risk-map")

@router.get("")
def risk_map():
    return {
        "projects": [
            {
                "project_id": "demo-project-1",
                "name": "Road Expansion A",
                "risk_label": "high",
                "risk_score": 0.86,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[9.18,45.46],[9.18,45.47],[9.20,45.47],[9.18,45.46]]]
                }
            },
            {
                "project_id": "demo-project-2",
                "name": "Mining Site B",
                "risk_label": "medium",
                "risk_score": 0.55,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[9.15,45.45],[9.15,45.46],[9.17,45.46],[9.15,45.45]]]
                }
            }
        ]
    }
