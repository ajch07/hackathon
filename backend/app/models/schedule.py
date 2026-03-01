from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class CognitiveRequirement(str, enum.Enum):
    HIGH_FOCUS = "HIGH_FOCUS"
    MEMORY_INTENSIVE = "MEMORY_INTENSIVE"
    CREATIVE = "CREATIVE"
    ROUTINE = "ROUTINE"


class StudySchedule(Base):
    __tablename__ = "study_schedules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recommended_time = Column(DateTime, nullable=False)
    subject = Column(String, nullable=False)
    cognitive_requirement = Column(Enum(CognitiveRequirement), nullable=False)
    estimated_energy_level = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="study_schedules")


class EnergyPattern(Base):
    __tablename__ = "energy_patterns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    hour_of_day = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    average_cognitive_score = Column(Float, nullable=False)
    sample_count = Column(Integer, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="energy_patterns")
