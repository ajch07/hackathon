from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class LearningDNA(Base):
    __tablename__ = "learning_dna"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    last_calculated = Column(DateTime, default=datetime.utcnow)
    peak_hours = Column(JSON, nullable=True)
    fatigue_zone = Column(JSON, nullable=True)
    avg_peak_score = Column(Float, nullable=True)
    typical_session_limit_mins = Column(Integer, nullable=True)
    best_day_of_week = Column(String, nullable=True)
    worst_day_of_week = Column(String, nullable=True)
    primary_fatigue_signal = Column(String, nullable=True)
    chronotype = Column(String, nullable=True)
    personal_baseline = Column(JSON, nullable=True)
    smart_insight = Column(Text, nullable=True)
    data_points_count = Column(Integer, default=0)

    user = relationship("User", back_populates="learning_dna")
