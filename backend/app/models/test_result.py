from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base


class TestType(str, enum.Enum):
    REACTION_TIME = "REACTION_TIME"
    PATTERN_RECOGNITION = "PATTERN_RECOGNITION"
    ATTENTION_SPAN = "ATTENTION_SPAN"


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    test_type = Column(Enum(TestType), nullable=False)
    raw_score = Column(Float, nullable=False)
    normalized_score = Column(Float, nullable=False)
    duration = Column(Integer, nullable=False)
    test_metadata = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="test_results")
