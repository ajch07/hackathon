from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class CognitiveSnapshot(Base):
    __tablename__ = "cognitive_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, nullable=False)
    focus_score = Column(Float, nullable=False)
    memory_score = Column(Float, nullable=False)
    reaction_score = Column(Float, nullable=False)
    time_of_day = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Phase 2 columns (nullable for backward compatibility)
    webcam_fatigue_score = Column(Float, nullable=True)
    combined_cognitive_score = Column(Float, nullable=True)
    fatigue_level = Column(String, nullable=True)

    user = relationship("User", back_populates="cognitive_snapshots")
