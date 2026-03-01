from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cognitive_snapshot import CognitiveSnapshot
from app.schemas.dashboard import TreeNode, CognitiveSnapshotResponse, TrendPoint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def get_default_tree() -> TreeNode:
    return TreeNode(
        id="root",
        name="Overall",
        score=50,
        children=[
            TreeNode(id="focus", name="Focus", score=50, children=[]),
            TreeNode(id="memory", name="Memory", score=50, children=[]),
            TreeNode(id="reaction", name="Reaction", score=50, children=[]),
        ]
    )


@router.get("/tree", response_model=TreeNode)
def get_tree(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    snapshots = db.query(CognitiveSnapshot).filter(
        CognitiveSnapshot.user_id == current_user.id
    ).order_by(CognitiveSnapshot.timestamp.desc()).limit(15).all()
    
    if not snapshots:
        return get_default_tree()
    
    # Get last 5 snapshots for display
    display_snapshots = snapshots[:5]
    
    def format_time(ts: datetime) -> str:
        return ts.strftime("%a %I%p")
    
    # Calculate averages of displayed child nodes
    focus_scores = [s.focus_score for s in display_snapshots]
    memory_scores = [s.memory_score for s in display_snapshots]
    reaction_scores = [s.reaction_score for s in display_snapshots]
    
    avg_focus = sum(focus_scores) / len(focus_scores) if focus_scores else 50
    avg_memory = sum(memory_scores) / len(memory_scores) if memory_scores else 50
    avg_reaction = sum(reaction_scores) / len(reaction_scores) if reaction_scores else 50
    avg_overall = (avg_focus * 0.3) + (avg_memory * 0.4) + (avg_reaction * 0.3)
    
    return TreeNode(
        id="root",
        name="Overall",
        score=round(avg_overall),
        children=[
            TreeNode(
                id="focus",
                name="Focus",
                score=round(avg_focus),
                children=[
                    TreeNode(id=f"focus-{i}", name=format_time(s.timestamp), score=round(s.focus_score))
                    for i, s in enumerate(display_snapshots)
                ]
            ),
            TreeNode(
                id="memory",
                name="Memory",
                score=round(avg_memory),
                children=[
                    TreeNode(id=f"memory-{i}", name=format_time(s.timestamp), score=round(s.memory_score))
                    for i, s in enumerate(display_snapshots)
                ]
            ),
            TreeNode(
                id="reaction",
                name="Reaction",
                score=round(avg_reaction),
                children=[
                    TreeNode(id=f"reaction-{i}", name=format_time(s.timestamp), score=round(s.reaction_score))
                    for i, s in enumerate(display_snapshots)
                ]
            ),
        ]
    )


@router.get("/summary", response_model=CognitiveSnapshotResponse)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    latest = db.query(CognitiveSnapshot).filter(
        CognitiveSnapshot.user_id == current_user.id
    ).order_by(CognitiveSnapshot.timestamp.desc()).first()
    
    if not latest:
        # Return default
        now = datetime.utcnow()
        return CognitiveSnapshotResponse(
            id="default",
            user_id=current_user.id,
            overall_score=50,
            focus_score=50,
            memory_score=50,
            reaction_score=50,
            time_of_day=f"{now.hour}:{now.minute:02d}",
            timestamp=now
        )
    
    return CognitiveSnapshotResponse.model_validate(latest)


@router.get("/trends", response_model=List[TrendPoint])
def get_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 14
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    snapshots = db.query(CognitiveSnapshot).filter(
        CognitiveSnapshot.user_id == current_user.id,
        CognitiveSnapshot.timestamp >= start_date
    ).order_by(CognitiveSnapshot.timestamp.asc()).all()
    
    # Group by date, collecting both overall and webcam scores
    grouped = {}
    for s in snapshots:
        date_str = s.timestamp.strftime("%Y-%m-%d")
        if date_str not in grouped:
            grouped[date_str] = {"scores": [], "webcam_scores": []}
        grouped[date_str]["scores"].append(s.overall_score)
        if s.webcam_fatigue_score is not None:
            grouped[date_str]["webcam_scores"].append(s.webcam_fatigue_score)
    
    result = []
    for date, data in grouped.items():
        avg_score = round(sum(data["scores"]) / len(data["scores"]))
        avg_webcam = None
        if data["webcam_scores"]:
            avg_webcam = round(sum(data["webcam_scores"]) / len(data["webcam_scores"]))
        result.append(TrendPoint(date=date, score=avg_score, webcam_score=avg_webcam))
    
    return result
