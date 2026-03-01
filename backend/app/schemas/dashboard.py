from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TreeNode(BaseModel):
    id: str
    name: str
    score: int
    children: Optional[List["TreeNode"]] = None


class CognitiveSnapshotResponse(BaseModel):
    id: str
    user_id: str
    overall_score: float
    focus_score: float
    memory_score: float
    reaction_score: float
    time_of_day: str
    timestamp: datetime

    class Config:
        from_attributes = True


class TrendPoint(BaseModel):
    date: str
    score: int
    webcam_score: Optional[int] = None


class DashboardResponse(BaseModel):
    tree: TreeNode
    summary: CognitiveSnapshotResponse
    trends: List[TrendPoint]
