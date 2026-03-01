from fastapi import APIRouter
from datetime import datetime
import random

router = APIRouter(prefix="/demo", tags=["Demo"])


@router.get("/user")
def get_demo_user():
    return {
        "id": "demo-user-001",
        "email": "demo@cognitrack.app",
        "name": "Alex Student",
        "created_at": datetime.utcnow().isoformat()
    }


@router.get("/dashboard")
def get_demo_dashboard():
    mock_tree = {
        "id": "root",
        "name": "Overall",
        "score": 78,
        "children": [
            {
                "id": "focus",
                "name": "Focus",
                "score": 82,
                "children": [
                    {"id": "focus-1", "name": "Mon 9AM", "score": 85},
                    {"id": "focus-2", "name": "Tue 10AM", "score": 79},
                    {"id": "focus-3", "name": "Wed 9AM", "score": 88},
                    {"id": "focus-4", "name": "Thu 11AM", "score": 76},
                    {"id": "focus-5", "name": "Fri 9AM", "score": 82},
                ]
            },
            {
                "id": "memory",
                "name": "Memory",
                "score": 75,
                "children": [
                    {"id": "memory-1", "name": "Mon 2PM", "score": 72},
                    {"id": "memory-2", "name": "Tue 3PM", "score": 78},
                    {"id": "memory-3", "name": "Wed 2PM", "score": 71},
                    {"id": "memory-4", "name": "Thu 4PM", "score": 80},
                    {"id": "memory-5", "name": "Fri 2PM", "score": 74},
                ]
            },
            {
                "id": "reaction",
                "name": "Reaction",
                "score": 76,
                "children": [
                    {"id": "reaction-1", "name": "Mon 8AM", "score": 82},
                    {"id": "reaction-2", "name": "Tue 8AM", "score": 74},
                    {"id": "reaction-3", "name": "Wed 8AM", "score": 79},
                    {"id": "reaction-4", "name": "Thu 8AM", "score": 71},
                    {"id": "reaction-5", "name": "Fri 8AM", "score": 74},
                ]
            }
        ]
    }
    
    mock_summary = {
        "id": "snapshot-001",
        "user_id": "demo-user-001",
        "overall_score": 78,
        "focus_score": 82,
        "memory_score": 75,
        "reaction_score": 76,
        "time_of_day": "10:30",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    mock_trends = []
    for i in range(14):
        date = datetime.utcnow()
        date = date.replace(day=date.day - (13 - i)) if date.day > 13 else date
        mock_trends.append({
            "date": date.strftime("%Y-%m-%d"),
            "score": 65 + random.randint(0, 24)
        })
    
    return {
        "tree": mock_tree,
        "summary": mock_summary,
        "trends": mock_trends
    }
