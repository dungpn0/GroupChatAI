from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user
from app.models import User

router = APIRouter()


class AIMessageRequest(BaseModel):
    message: str
    group_id: int
    model: str = "gemini"  # Default to cheapest model


class SendMessageRequest(BaseModel):
    content: str
    group_id: int


class AIMessageResponse(BaseModel):
    response: Optional[str] = None
    model: str
    credits_used: float
    success: bool
    error: Optional[str] = None
    user_credits_remaining: Optional[float] = None


@router.get("/")
async def get_messages(
    group_id: int = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages from groups user belongs to"""
    from app.models import Message, ChatGroup, GroupMember
    from sqlalchemy import and_, desc
    
    query = db.query(Message).join(ChatGroup).join(GroupMember)
    
    if group_id:
        # Get messages from specific group if user is a member
        query = query.filter(
            and_(
                Message.group_id == group_id,
                GroupMember.user_id == current_user.id,
                GroupMember.group_id == group_id
            )
        )
    else:
        # Get messages from all groups user belongs to
        query = query.filter(GroupMember.user_id == current_user.id)
    
    messages = query.order_by(desc(Message.created_at)).offset(offset).limit(limit).all()
    
    return {
        "messages": [
            {
                "id": msg.id,
                "content": msg.content,
                "user_id": msg.user_id,
                "group_id": msg.group_id,
                "created_at": msg.created_at.isoformat(),
                "is_ai_message": msg.is_ai_message,
                "ai_model_used": msg.ai_model_used
            } for msg in messages
        ],
        "total": len(messages),
        "limit": limit,
        "offset": offset
    }


@router.post("/send")
async def send_message(
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to a group"""
    from app.models import Message, GroupMember
    from datetime import datetime
    from sqlalchemy import and_
    
    # Check if user is member of the group
    membership = db.query(GroupMember).filter(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == request.group_id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Create message
    new_message = Message(
        content=request.content,
        user_id=current_user.id,
        group_id=request.group_id,
        created_at=datetime.utcnow(),
        is_ai_message=False
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return {
        "message": "Message sent successfully",
        "message_id": new_message.id,
        "created_at": new_message.created_at.isoformat()
    }


@router.post("/ai", response_model=AIMessageResponse)
async def send_ai_message(
    request: AIMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to AI and deduct credits"""
    from app.models import Message, GroupMember
    from datetime import datetime
    from sqlalchemy import and_
    
    ai_service = AIService(db)
    
    # Check if user is member of the group
    membership = db.query(GroupMember).filter(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == request.group_id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Save user's message first
    user_message = Message(
        content=request.message,
        user_id=current_user.id,
        group_id=request.group_id,
        created_at=datetime.utcnow(),
        is_ai_message=False
    )
    db.add(user_message)
    
    # Process AI request
    result = await ai_service.process_ai_request(
        user_id=current_user.id,
        model=request.model,
        message=request.message
    )
    
    # If AI request succeeded, save AI response
    if result.get("success"):
        ai_message = Message(
            content=result.get("response"),
            user_id=None,  # AI messages have no user_id
            group_id=request.group_id,
            created_at=datetime.utcnow(),
            is_ai_message=True,
            ai_model_used=request.model
        )
        db.add(ai_message)
    
    db.commit()
    
    # Get updated user credits
    updated_user = await ai_service.user_service.get_user(current_user.id)
    user_credits = updated_user.credits if updated_user else 0
    
    return AIMessageResponse(
        response=result.get("response"),
        model=request.model,
        credits_used=ai_service.get_ai_model_rate(request.model) if result.get("success") else 0,
        success=result.get("success", False),
        error=result.get("error"),
        user_credits_remaining=user_credits
    )


@router.get("/ai/models")
async def get_ai_models():
    """Get available AI models and their credit rates"""
    from app.core.config import settings
    
    return {
        "models": [
            {
                "name": "gemini",
                "display_name": "Google Gemini",
                "credit_rate": settings.GEMINI_CREDIT_RATE,
                "description": "Fast and economical AI model"
            },
            {
                "name": "openai-gpt3.5",
                "display_name": "OpenAI GPT-3.5",
                "credit_rate": settings.OPENAI_GPT35_CREDIT_RATE,
                "description": "Balanced performance and cost"
            },
            {
                "name": "openai-gpt4",
                "display_name": "OpenAI GPT-4",
                "credit_rate": settings.OPENAI_GPT4_CREDIT_RATE,
                "description": "Most advanced AI model (higher cost)"
            }
        ]
    }