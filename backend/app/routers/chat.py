from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import get_settings
from app.models.user import User
from app.models.chat_message import ChatMessage
from app.schemas.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatHistoryResponse,
    OnboardingRequest,
    OnboardingResponse,
)
from app.services.chat_service import chat_with_ai

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/message", response_model=ChatMessageResponse)
def send_message(
    req: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check API key is configured before proceeding
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="OpenAI API key is not configured on the server.")

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=req.message,
        timestamp=datetime.utcnow(),
    )
    db.add(user_msg)
    db.commit()

    # Get AI response
    ai_response = chat_with_ai(db, current_user, req.message)

    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_response,
        timestamp=datetime.utcnow(),
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return ChatMessageResponse.model_validate(assistant_msg)


@router.get("/history", response_model=ChatHistoryResponse)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50,
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.timestamp.asc())
        .limit(limit)
        .all()
    )
    return ChatHistoryResponse(
        messages=[ChatMessageResponse.model_validate(m) for m in messages]
    )


@router.post("/onboarding", response_model=OnboardingResponse)
def save_onboarding(
    data: OnboardingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.field_of_study = data.field_of_study
    current_user.subjects = data.subjects
    current_user.onboarding_done = "true"
    db.commit()

    return OnboardingResponse(
        success=True,
        field_of_study=data.field_of_study,
        subjects=data.subjects,
    )


@router.get("/profile")
def get_study_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {
        "field_of_study": current_user.field_of_study,
        "subjects": current_user.subjects or [],
        "onboarding_done": current_user.onboarding_done == "true",
    }
