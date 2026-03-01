from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.test_result import TestResult, TestType
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.schemas.test import TestSubmit, TestResultResponse, TestStats, TestTypeInfo

router = APIRouter(prefix="/tests", tags=["Cognitive Tests"])


def calculate_normalized_score(test_type: TestType, raw_score: float, metadata: dict) -> float:
    """Calculate normalized score (0-100) based on test type"""
    if test_type == TestType.REACTION_TIME:
        # raw_score is avg reaction time in ms (200ms = 100, 600ms = 0)
        return max(0, min(100, 100 - ((raw_score - 200) / 4)))
    
    elif test_type == TestType.PATTERN_RECOGNITION:
        # raw_score is number correct
        total = metadata.get("total", 10)
        return (raw_score / total) * 100
    
    elif test_type == TestType.ATTENTION_SPAN:
        # raw_score is tracking accuracy percentage
        return raw_score
    
    return raw_score


def compute_fatigue_level(score: float) -> str:
    if score >= 80:
        return "alert"
    elif score >= 60:
        return "mild_fatigue"
    elif score >= 40:
        return "moderate_fatigue"
    return "high_fatigue"


def update_cognitive_snapshot(db: Session, user_id: str, webcam_fatigue_score: float = None):
    """Update cognitive snapshot after a test"""
    recent_results = db.query(TestResult).filter(
        TestResult.user_id == user_id
    ).order_by(TestResult.timestamp.desc()).limit(15).all()
    
    if not recent_results:
        return
    
    reaction_scores = [r.normalized_score for r in recent_results if r.test_type == TestType.REACTION_TIME]
    pattern_scores = [r.normalized_score for r in recent_results if r.test_type == TestType.PATTERN_RECOGNITION]
    attention_scores = [r.normalized_score for r in recent_results if r.test_type == TestType.ATTENTION_SPAN]
    
    def avg(scores):
        return sum(scores) / len(scores) if scores else 50
    
    reaction_score = avg(reaction_scores)
    memory_score = avg(pattern_scores)
    focus_score = avg(attention_scores)
    overall_score = (reaction_score * 0.3) + (memory_score * 0.4) + (focus_score * 0.3)
    
    now = datetime.utcnow()
    time_of_day = f"{now.hour}:{now.minute:02d}"
    
    # Calculate combined score and fatigue level if webcam data available
    combined_cognitive_score = None
    fatigue_level = None
    if webcam_fatigue_score is not None:
        combined_cognitive_score = overall_score * 0.75 + webcam_fatigue_score * 0.25
        fatigue_level = compute_fatigue_level(combined_cognitive_score)
    
    snapshot = CognitiveSnapshot(
        user_id=user_id,
        overall_score=overall_score,
        focus_score=focus_score,
        memory_score=memory_score,
        reaction_score=reaction_score,
        time_of_day=time_of_day,
        webcam_fatigue_score=webcam_fatigue_score,
        combined_cognitive_score=combined_cognitive_score,
        fatigue_level=fatigue_level
    )
    db.add(snapshot)
    db.commit()


@router.post("/submit", response_model=TestResultResponse)
def submit_test(
    test_data: TestSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    normalized_score = calculate_normalized_score(
        TestType(test_data.test_type.value),
        test_data.raw_score,
        test_data.metadata
    )
    
    result = TestResult(
        user_id=current_user.id,
        test_type=TestType(test_data.test_type.value),
        raw_score=test_data.raw_score,
        normalized_score=normalized_score,
        duration=test_data.duration,
        test_metadata=test_data.metadata
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    
    # Extract webcam fatigue score from metadata if present
    webcam_fatigue_score = test_data.metadata.get("webcam_fatigue_score") if test_data.metadata else None
    
    # Update cognitive snapshot with webcam data
    update_cognitive_snapshot(db, current_user.id, webcam_fatigue_score)
    
    # Update energy patterns based on cognitive data
    try:
        from app.services.energy_service import update_energy_patterns
        update_energy_patterns(db, current_user.id)
    except Exception:
        pass  # Energy pattern failure should not break test submission
    
    # Auto-trigger DNA calculation every 5th test
    total_tests = db.query(func.count(TestResult.id)).filter(
        TestResult.user_id == current_user.id
    ).scalar()
    if total_tests and total_tests % 3 == 0 and total_tests >= 3:
        try:
            from app.services.dna_service import calculate_dna
            calculate_dna(db, current_user.id)
        except Exception:
            pass  # DNA calculation failure should not break test submission
    
    return TestResultResponse.model_validate(result)


@router.get("/results", response_model=List[TestResultResponse])
def get_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    results = db.query(TestResult).filter(
        TestResult.user_id == current_user.id
    ).order_by(TestResult.timestamp.desc()).limit(limit).all()
    
    return [TestResultResponse.model_validate(r) for r in results]


@router.get("/stats", response_model=TestStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(TestResult).filter(
        TestResult.user_id == current_user.id
    ).all()
    
    if not results:
        return TestStats(avg=0, count=0)
    
    avg_score = sum(r.normalized_score for r in results) / len(results)
    return TestStats(avg=round(avg_score), count=len(results))


@router.get("/types", response_model=List[TestTypeInfo])
def get_types():
    return [
        TestTypeInfo(id="REACTION_TIME", name="Reaction Time", duration="~1 min"),
        TestTypeInfo(id="PATTERN_RECOGNITION", name="Pattern Memory", duration="~2 min"),
        TestTypeInfo(id="ATTENTION_SPAN", name="Attention Tracking", duration="~1.5 min"),
    ]
