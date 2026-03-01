from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime


class DNANotReady(BaseModel):
    ready: bool = False
    data_points: int
    needed: int = 20
    message: str = "Take more tests to unlock your Learning DNA"


class DNAProfileResponse(BaseModel):
    ready: bool = True
    id: str
    user_id: str
    last_calculated: Optional[datetime] = None
    peak_hours: Optional[List[str]] = None
    fatigue_zone: Optional[List[str]] = None
    avg_peak_score: Optional[float] = None
    typical_session_limit_mins: Optional[int] = None
    best_day_of_week: Optional[str] = None
    worst_day_of_week: Optional[str] = None
    primary_fatigue_signal: Optional[str] = None
    chronotype: Optional[str] = None
    personal_baseline: Optional[Dict[str, float]] = None
    smart_insight: Optional[str] = None
    data_points_count: int = 0

    class Config:
        from_attributes = True


class DailyPatternPoint(BaseModel):
    hour: int
    avg_score: float
    session_count: int


class DNACalculateResponse(BaseModel):
    success: bool
    message: str
    data_points_count: int = 0
