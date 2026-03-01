from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WebcamSnapshotCreate(BaseModel):
    blink_rate: Optional[float] = None
    perclos: Optional[float] = None
    head_stability: Optional[float] = None
    gaze_stability: Optional[float] = None
    webcam_fatigue_score: Optional[float] = None
    test_result_id: Optional[str] = None


class WebcamSnapshotResponse(BaseModel):
    success: bool
    combined_cognitive_score: Optional[float] = None
    fatigue_level: Optional[str] = None

    class Config:
        from_attributes = True
