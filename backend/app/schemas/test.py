from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime
from enum import Enum


class TestType(str, Enum):
    REACTION_TIME = "REACTION_TIME"
    PATTERN_RECOGNITION = "PATTERN_RECOGNITION"
    ATTENTION_SPAN = "ATTENTION_SPAN"


class TestSubmit(BaseModel):
    test_type: TestType
    raw_score: float
    duration: int
    metadata: Dict[str, Any] = {}


class TestResultResponse(BaseModel):
    id: str
    user_id: str
    test_type: TestType
    raw_score: float
    normalized_score: float
    duration: int
    test_metadata: Dict[str, Any]
    timestamp: datetime

    class Config:
        from_attributes = True


class TestStats(BaseModel):
    avg: float
    count: int


class TestTypeInfo(BaseModel):
    id: str
    name: str
    duration: str
