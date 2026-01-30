from pydantic import BaseModel
from typing import Any

GeoJSON = dict[str, Any]

class Message(BaseModel):
    message: str
