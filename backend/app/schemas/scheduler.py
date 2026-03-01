from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum


class CognitiveRequirement(str, Enum):
    HIGH_FOCUS = "HIGH_FOCUS"
    MEMORY_INTENSIVE = "MEMORY_INTENSIVE"
    CREATIVE = "CREATIVE"
    ROUTINE = "ROUTINE"


class StudyScheduleResponse(BaseModel):
    id: str
    user_id: str
    recommended_time: datetime
    subject: str
    cognitive_requirement: CognitiveRequirement
    estimated_energy_level: float
    confidence: float
    reason: str
    completed: bool

    class Config:
        from_attributes = True


class EnergyPatternResponse(BaseModel):
    hour_of_day: int
    day_of_week: int
    average_cognitive_score: float
    sample_count: int


class SleepLog(BaseModel):
    hours: float
