from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessageRequest(BaseModel):
    message: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessageResponse]


class OnboardingRequest(BaseModel):
    field_of_study: str
    subjects: List[str]


class OnboardingResponse(BaseModel):
    success: bool
    field_of_study: str
    subjects: List[str]


class UserProfileUpdate(BaseModel):
    field_of_study: Optional[str] = None
    subjects: Optional[List[str]] = None
