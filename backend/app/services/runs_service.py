# here we mock the deforestation detection results
# update later with actual processing logic

import uuid
from app.schemas.runs import (
    DeforestationResponse,
    DeforestationStats,
    OutputLinks,
    DeforestationPolygon,
)

def get_deforestation_result(project_id: str, latest: bool = True) -> DeforestationResponse:
    run_id = str(uuid.uuid4())
    polygons = [
        DeforestationPolygon(
            id=str(uuid.uuid4()),
            area_ha=2.3,
            confidence="high",
            geometry={"type": "Polygon", "coordinates": [[[0,0],[0,1],[1,1],[0,0]]]},
        )
    ]
    return DeforestationResponse(
        project_id=project_id,
        run_id=run_id,
        start_date="2026-01-01",
        end_date="2026-01-28",
        stats=DeforestationStats(area_ha=2.3, polygon_count=len(polygons)),
        outputs=OutputLinks(
            before_rgb=None,
            after_rgb=None,
            delta_png=None,
            report_pdf=None,
            polygons_geojson=None,
        ),
        polygons=polygons,
    )
