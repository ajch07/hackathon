from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.webcam_snapshot import WebcamSnapshot
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.schemas.webcam import WebcamSnapshotCreate, WebcamSnapshotResponse

router = APIRouter(prefix="/webcam", tags=["Webcam"])


def compute_fatigue_level(score: float) -> str:
    if score >= 80:
        return "alert"
    elif score >= 60:
        return "mild_fatigue"
    elif score >= 40:
        return "moderate_fatigue"
    return "high_fatigue"


@router.post("/snapshot", response_model=WebcamSnapshotResponse)
def save_webcam_snapshot(
    data: WebcamSnapshotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Save webcam snapshot
    snapshot = WebcamSnapshot(
        user_id=current_user.id,
        timestamp=datetime.utcnow(),
        blink_rate=data.blink_rate,
        perclos=data.perclos,
        head_stability=data.head_stability,
        gaze_stability=data.gaze_stability,
        webcam_fatigue_score=data.webcam_fatigue_score,
        test_result_id=data.test_result_id,
    )
    db.add(snapshot)
    db.flush()

    # Find latest cognitive_snapshot for user and update it
    latest_snapshot = (
        db.query(CognitiveSnapshot)
        .filter(CognitiveSnapshot.user_id == current_user.id)
        .order_by(CognitiveSnapshot.timestamp.desc())
        .first()
    )

    combined_score = None
    fatigue_level = None

    if latest_snapshot and data.webcam_fatigue_score is not None:
        combined_score = latest_snapshot.overall_score * 0.75 + data.webcam_fatigue_score * 0.25
        fatigue_level = compute_fatigue_level(combined_score)

        latest_snapshot.webcam_fatigue_score = data.webcam_fatigue_score
        latest_snapshot.combined_cognitive_score = combined_score
        latest_snapshot.fatigue_level = fatigue_level

    db.commit()

    return WebcamSnapshotResponse(
        success=True,
        combined_cognitive_score=combined_score,
        fatigue_level=fatigue_level,
    )
