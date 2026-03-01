from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    sleep_data = Column(JSON, nullable=True)
    field_of_study = Column(String, nullable=True)
    subjects = Column(JSON, nullable=True)  # List of subject strings
    onboarding_done = Column(String, nullable=True, default=None)  # "true" when done
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    test_results = relationship("TestResult", back_populates="user", cascade="all, delete-orphan")
    cognitive_snapshots = relationship("CognitiveSnapshot", back_populates="user", cascade="all, delete-orphan")
    study_schedules = relationship("StudySchedule", back_populates="user", cascade="all, delete-orphan")
    energy_patterns = relationship("EnergyPattern", back_populates="user", cascade="all, delete-orphan")
    webcam_snapshots = relationship("WebcamSnapshot", back_populates="user", cascade="all, delete-orphan")
    learning_dna = relationship("LearningDNA", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
