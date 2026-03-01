from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from collections import defaultdict
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.models.learning_dna import LearningDNA
from app.schemas.dna import DNANotReady, DNAProfileResponse, DailyPatternPoint, DNACalculateResponse
from app.services.dna_service import calculate_dna

router = APIRouter(prefix="/dna", tags=["Learning DNA"])


@router.get("/profile")
def get_dna_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snapshot_count = (
        db.query(func.count(CognitiveSnapshot.id))
        .filter(CognitiveSnapshot.user_id == current_user.id)
        .scalar()
    )

    if snapshot_count < 3:
        return DNANotReady(
            data_points=snapshot_count,
            needed=3,
            message="Take more tests to unlock your Learning DNA",
        )

    # Check if DNA already exists
    existing = db.query(LearningDNA).filter(LearningDNA.user_id == current_user.id).first()
    if not existing:
        existing = calculate_dna(db, current_user.id)

    if not existing:
        return DNANotReady(
            data_points=snapshot_count,
            needed=20,
            message="Unable to calculate DNA profile. Try again later.",
        )

    return DNAProfileResponse(
        ready=True,
        id=existing.id,
        user_id=existing.user_id,
        last_calculated=existing.last_calculated,
        peak_hours=existing.peak_hours,
        fatigue_zone=existing.fatigue_zone,
        avg_peak_score=existing.avg_peak_score,
        typical_session_limit_mins=existing.typical_session_limit_mins,
        best_day_of_week=existing.best_day_of_week,
        worst_day_of_week=existing.worst_day_of_week,
        primary_fatigue_signal=existing.primary_fatigue_signal,
        chronotype=existing.chronotype,
        personal_baseline=existing.personal_baseline,
        smart_insight=existing.smart_insight,
        data_points_count=existing.data_points_count,
    )


@router.get("/daily-pattern", response_model=List[DailyPatternPoint])
def get_daily_pattern(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snapshots = (
        db.query(CognitiveSnapshot)
        .filter(CognitiveSnapshot.user_id == current_user.id)
        .all()
    )

    hour_data = defaultdict(list)
    for s in snapshots:
        score = s.combined_cognitive_score if s.combined_cognitive_score is not None else s.overall_score
        hour_data[s.timestamp.hour].append(score)

    result = []
    for hour in range(24):
        scores = hour_data.get(hour, [])
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        result.append(DailyPatternPoint(
            hour=hour,
            avg_score=avg_score,
            session_count=len(scores),
        ))

    return result


@router.post("/calculate", response_model=DNACalculateResponse)
def trigger_dna_calculation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snapshot_count = (
        db.query(func.count(CognitiveSnapshot.id))
        .filter(CognitiveSnapshot.user_id == current_user.id)
        .scalar()
    )

    if snapshot_count < 3:
        return DNACalculateResponse(
            success=False,
            message=f"Need at least 3 sessions. You have {snapshot_count}.",
            data_points_count=snapshot_count,
        )

    dna = calculate_dna(db, current_user.id)
    if dna:
        return DNACalculateResponse(
            success=True,
            message="Learning DNA recalculated successfully.",
            data_points_count=dna.data_points_count,
        )

    return DNACalculateResponse(
        success=False,
        message="Failed to calculate DNA. Try again later.",
        data_points_count=snapshot_count,
    )
