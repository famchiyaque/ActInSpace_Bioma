"""Sentinel Hub service for fetching and storing RGB satellite images."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Tuple, Any
import os

from dotenv import load_dotenv

import numpy as np
from PIL import Image
from sentinelhub import (
    SHConfig,
    BBox,
    CRS,
    DataCollection,
    MimeType,
    MosaickingOrder,
    SentinelHubRequest,
    bbox_to_dimensions,
)

from app.services.storage_service import upload_bytes


EVALSCRIPT_RGB = """
//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02", "dataMask"],
    output: { bands: 4, sampleType: "UINT8" }
  };
}

function evaluatePixel(sample) {
  return [sample.B04 * 255, sample.B03 * 255, sample.B02 * 255, sample.dataMask * 255];
}
"""


@dataclass
class SentinelService:
    config: SHConfig

    def fetch_rgb_image(
        self,
        bbox: Tuple[float, float, float, float],
        date_from: datetime,
        date_to: datetime,
        resolution: int = 20,
        max_cloud_coverage: int = 30,
    ) -> Tuple[np.ndarray, dict[str, Any]]:
        """Fetch an RGB image from Sentinel Hub.

        Returns a tuple of (rgb_array, metadata).
        """
        bbox_obj = BBox(bbox=bbox, crs=CRS.WGS84)
        size = bbox_to_dimensions(bbox_obj, resolution=resolution)

        request = SentinelHubRequest(
            evalscript=EVALSCRIPT_RGB,
            input_data=[
                SentinelHubRequest.input_data(
                    data_collection=DataCollection.SENTINEL2_L2A,
                    time_interval=(date_from.date().isoformat(), date_to.date().isoformat()),
                    mosaicking_order=MosaickingOrder.LEAST_CC,
                    maxcc=max_cloud_coverage / 100.0,
                )
            ],
            responses=[SentinelHubRequest.output_response("default", MimeType.PNG)],
            bbox=bbox_obj,
            size=size,
            config=self.config,
        )

        data = request.get_data()
        if not data:
            raise RuntimeError("No imagery returned from Sentinel Hub")

        img = data[0]
        # Ensure uint8 RGB
        if img.dtype != np.uint8:
            img = np.clip(img, 0, 255).astype(np.uint8)

        if img.shape[-1] == 4:
            img_rgb = img[:, :, :3]
        else:
            img_rgb = img

        return img_rgb, {"size": size, "bbox": bbox}

    def save_rgb_image(self, rgb_array: np.ndarray, path: str) -> str:
        """Save RGB image to Supabase storage and return public URL."""
        if rgb_array.dtype != np.uint8:
            rgb_array = np.clip(rgb_array, 0, 255).astype(np.uint8)

        image = Image.fromarray(rgb_array, mode="RGB")
        with _BytesIO() as buffer:
            image.save(buffer, format="PNG")
            content = buffer.getvalue()

        return upload_bytes(path=path, content=content, content_type="image/png")


class _BytesIO:
    """Small context-managed BytesIO wrapper to avoid importing io globally."""

    def __enter__(self):
        from io import BytesIO

        self._buffer = BytesIO()
        return self._buffer

    def __exit__(self, exc_type, exc, tb):
        self._buffer.close()
        return False


def _build_config() -> SHConfig:
    load_dotenv()
    config = SHConfig()

    # Allow env vars to override defaults
    config.sh_client_id = os.getenv(
        "SENTINEL_HUB_CLIENT_ID",
        os.getenv("SH_CLIENT_ID", config.sh_client_id),
    )
    config.sh_client_secret = os.getenv(
        "SENTINEL_HUB_CLIENT_SECRET",
        os.getenv("SH_CLIENT_SECRET", config.sh_client_secret),
    )
    config.sh_base_url = os.getenv("SH_BASE_URL", config.sh_base_url)
    config.sh_token_url = os.getenv("SH_TOKEN_URL", config.sh_token_url)

    if not config.sh_client_id or not config.sh_client_secret:
        raise RuntimeError(
            "Missing Sentinel Hub credentials. Set SH_CLIENT_ID and SH_CLIENT_SECRET in your environment."
        )

    return config


def get_sentinel_service() -> SentinelService:
    return SentinelService(config=_build_config())
