"""
Energy Pattern Service
Calculates and stores user energy patterns based on cognitive snapshots
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import defaultdict
from datetime import datetime
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.models.schedule import EnergyPattern


def update_energy_patterns(db: Session, user_id: str) -> None:
    """
    Calculate and update energy patterns for a user based on their cognitive snapshots.
    Groups snapshots by hour of day and day of week to find patterns.
    """
    # Get all cognitive snapshots for this user
    snapshots = db.query(CognitiveSnapshot).filter(
        CognitiveSnapshot.user_id == user_id
    ).all()

    if not snapshots:
        return

    # Group by (hour, day_of_week)
    pattern_data = defaultdict(list)
    for s in snapshots:
        hour = s.timestamp.hour
        day = s.timestamp.weekday()  # 0=Monday, 6=Sunday
        score = s.combined_cognitive_score if s.combined_cognitive_score else s.overall_score
        pattern_data[(hour, day)].append(score)

    # Update or create energy patterns
    for (hour, day), scores in pattern_data.items():
        avg_score = sum(scores) / len(scores)
        sample_count = len(scores)

        # Check if pattern exists
        existing = db.query(EnergyPattern).filter(
            EnergyPattern.user_id == user_id,
            EnergyPattern.hour_of_day == hour,
            EnergyPattern.day_of_week == day
        ).first()

        if existing:
            existing.average_cognitive_score = avg_score
            existing.sample_count = sample_count
            existing.last_updated = datetime.utcnow()
        else:
            new_pattern = EnergyPattern(
                user_id=user_id,
                hour_of_day=hour,
                day_of_week=day,
                average_cognitive_score=avg_score,
                sample_count=sample_count,
            )
            db.add(new_pattern)

    db.commit()


def get_best_hours_for_user(db: Session, user_id: str, top_n: int = 3) -> list:
    """Get the top N hours with highest average cognitive scores"""
    patterns = db.query(EnergyPattern).filter(
        EnergyPattern.user_id == user_id
    ).order_by(EnergyPattern.average_cognitive_score.desc()).limit(top_n).all()

    return [{"hour": p.hour_of_day, "score": p.average_cognitive_score} for p in patterns]


def get_fatigue_hours_for_user(db: Session, user_id: str, bottom_n: int = 3) -> list:
    """Get the bottom N hours with lowest average cognitive scores"""
    patterns = db.query(EnergyPattern).filter(
        EnergyPattern.user_id == user_id
    ).order_by(EnergyPattern.average_cognitive_score.asc()).limit(bottom_n).all()

    return [{"hour": p.hour_of_day, "score": p.average_cognitive_score} for p in patterns]
