from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import random
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.schedule import EnergyPattern, CognitiveRequirement, StudySchedule
from app.schemas.scheduler import StudyScheduleResponse, EnergyPatternResponse, SleepLog

router = APIRouter(prefix="/scheduler", tags=["Scheduler"])


def get_default_score(hour: int) -> float:
    """Default energy score by hour of day"""
    if 6 <= hour <= 10:
        return 75
    elif 14 <= hour <= 16:
        return 55
    elif 19 <= hour <= 22:
        return 65
    return 40


def find_best_time(patterns: List[dict], requirement: str) -> int:
    """Find best time for a cognitive requirement"""
    if not patterns:
        defaults = {
            "HIGH_FOCUS": 9,
            "MEMORY_INTENSIVE": 10,
            "CREATIVE": 14,
            "ROUTINE": 19
        }
        return defaults.get(requirement, 9)
    
    sorted_patterns = sorted(patterns, key=lambda p: p["score"], reverse=True)
    
    if requirement == "HIGH_FOCUS":
        return sorted_patterns[0]["hour"]
    elif requirement == "MEMORY_INTENSIVE":
        return sorted_patterns[min(1, len(sorted_patterns) - 1)]["hour"]
    elif requirement == "CREATIVE":
        mid = len(sorted_patterns) // 2
        return sorted_patterns[mid]["hour"]
    else:  # ROUTINE
        return sorted_patterns[-1]["hour"]


def get_reason(requirement: str, hour: int) -> str:
    """Generate recommendation reason"""
    period = "morning" if hour < 12 else "afternoon" if hour < 17 else "evening"
    
    reasons = {
        "HIGH_FOCUS": f"Your focus peaks at {hour}:00. Best time for problem-solving and complex tasks!",
        "MEMORY_INTENSIVE": f"Your memory performance is strong in the {period}. Ideal for learning new material!",
        "CREATIVE": f"Moderate energy levels are perfect for creative tasks. Let ideas flow!",
        "ROUTINE": f"{period.capitalize()} review works well. Perfect for revision!"
    }
    return reasons.get(requirement, "Recommended based on your cognitive patterns.")


@router.get("/recommendations", response_model=List[StudyScheduleResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get energy patterns
    patterns_db = db.query(EnergyPattern).filter(
        EnergyPattern.user_id == current_user.id
    ).all()
    
    patterns = [{"hour": p.hour_of_day, "score": p.average_cognitive_score} for p in patterns_db]
    
    if not patterns:
        # Use default patterns
        patterns = [{"hour": h, "score": get_default_score(h)} for h in range(24)]
    
    now = datetime.utcnow()
    
    tasks = [
        ("Mathematics", "HIGH_FOCUS"),
        ("Language Learning", "MEMORY_INTENSIVE"),
        ("Creative Writing", "CREATIVE"),
        ("Review Notes", "ROUTINE"),
    ]
    
    # Clear old recommendations for this user
    db.query(StudySchedule).filter(StudySchedule.user_id == current_user.id).delete()
    
    recommendations = []
    for i, (subject, requirement) in enumerate(tasks):
        best_hour = find_best_time(patterns, requirement)
        
        recommended_time = now.replace(hour=best_hour, minute=0, second=0, microsecond=0)
        if recommended_time < now:
            recommended_time += timedelta(days=1)
        
        hour_pattern = next((p for p in patterns if p["hour"] == best_hour), None)
        energy_level = hour_pattern["score"] if hour_pattern else 50
        confidence = round(0.75 + random.random() * 0.2, 2)
        reason = get_reason(requirement, best_hour)
        
        # Persist to database
        schedule = StudySchedule(
            user_id=current_user.id,
            recommended_time=recommended_time,
            subject=subject,
            cognitive_requirement=CognitiveRequirement(requirement),
            estimated_energy_level=energy_level,
            confidence=confidence,
            reason=reason,
            completed=False,
        )
        db.add(schedule)
        db.flush()
        
        recommendations.append(StudyScheduleResponse(
            id=schedule.id,
            user_id=current_user.id,
            recommended_time=recommended_time,
            subject=subject,
            cognitive_requirement=CognitiveRequirement(requirement),
            estimated_energy_level=energy_level,
            confidence=confidence,
            reason=reason,
            completed=False
        ))
    
    db.commit()
    return recommendations


@router.get("/energy-pattern", response_model=List[EnergyPatternResponse])
def get_energy_pattern(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patterns = db.query(EnergyPattern).filter(
        EnergyPattern.user_id == current_user.id
    ).order_by(EnergyPattern.hour_of_day).all()
    
    if patterns:
        return [
            EnergyPatternResponse(
                hour_of_day=p.hour_of_day,
                day_of_week=p.day_of_week,
                average_cognitive_score=p.average_cognitive_score,
                sample_count=p.sample_count
            )
            for p in patterns
        ]
    
    # Return default pattern
    return [
        EnergyPatternResponse(
            hour_of_day=hour,
            day_of_week=1,
            average_cognitive_score=get_default_score(hour),
            sample_count=0
        )
        for hour in range(24)
    ]


@router.post("/sleep")
def log_sleep(
    sleep_data: SleepLog,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.sleep_data = {
        "last_logged": datetime.utcnow().isoformat(),
        "hours": sleep_data.hours
    }
    db.commit()
    return {"success": True, "hours": sleep_data.hours}


@router.post("/mark-complete/{schedule_id}")
def mark_complete(
    schedule_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedule = db.query(StudySchedule).filter(
        StudySchedule.id == schedule_id,
        StudySchedule.user_id == current_user.id
    ).first()
    if schedule:
        schedule.completed = True
        db.commit()
        return {"success": True}
    return {"success": False, "message": "Schedule not found"}
