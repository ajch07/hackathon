from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class WebcamSnapshot(Base):
    __tablename__ = "webcam_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    blink_rate = Column(Float, nullable=True)
    perclos = Column(Float, nullable=True)
    head_stability = Column(Float, nullable=True)
    gaze_stability = Column(Float, nullable=True)
    webcam_fatigue_score = Column(Float, nullable=True)
    test_result_id = Column(String, ForeignKey("test_results.id"), nullable=True)

    user = relationship("User", back_populates="webcam_snapshots")
