from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/deforestation")

@router.get("")
def deforestation(project_id: str | None = None):
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    return {
        "project_id": project_id,
        "run": {
            "run_id": "demo-run-2026-01",
            "start_date": "2026-01-01",
            "end_date": "2026-01-28",
            "algorithm": "ndvi_diff",
            "status": "done"
        },
        "stats": {"area_ha": 12.4, "polygon_count": 2},
        "outputs": {
            "before_rgb": None,
            "after_rgb": None,
            "delta_ndvi_png": None,
            "report_pdf": None,
            "polygons_geojson": None
        },
        "polygons": [
            {
                "id": "poly-1",
                "area_ha": 7.1,
                "confidence": "high",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[9.18,45.46],[9.18,45.465],[9.19,45.465],[9.18,45.46]]]
                }
            },
            {
                "id": "poly-2",
                "area_ha": 5.3,
                "confidence": "medium",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[9.185,45.462],[9.185,45.466],[9.195,45.466],[9.185,45.462]]]
                }
            }
        ]
    }
