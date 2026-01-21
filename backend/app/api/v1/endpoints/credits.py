from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.user_service import UserService
from app.models import User
from app.core.config import settings

router = APIRouter()


class CreditsResponse(BaseModel):
    current_credits: float
    default_credits: float
    ai_model_rates: dict


class CreditsUpdateRequest(BaseModel):
    amount: float


@router.get("/", response_model=CreditsResponse)
async def get_user_credits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's current credit information"""
    return CreditsResponse(
        current_credits=current_user.credits,
        default_credits=settings.DEFAULT_USER_CREDITS,
        ai_model_rates={
            "gemini": settings.GEMINI_CREDIT_RATE,
            "openai-gpt3.5": settings.OPENAI_GPT35_CREDIT_RATE,
            "openai-gpt4": settings.OPENAI_GPT4_CREDIT_RATE
        }
    )


@router.post("/add")
async def add_credits(
    request: CreditsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add credits to user account (admin function)"""
    user_service = UserService(db)
    updated_user = await user_service.update_user_credits(current_user.id, request.amount)
    
    return {
        "message": f"Added {request.amount} credits",
        "new_balance": updated_user.credits
    }


@router.get("/rates")
async def get_credit_rates():
    """Get AI model credit rates"""
    return {
        "ai_models": {
            "gemini": {
                "rate": settings.GEMINI_CREDIT_RATE,
                "description": "Google Gemini - Most economical"
            },
            "openai-gpt3.5": {
                "rate": settings.OPENAI_GPT35_CREDIT_RATE,
                "description": "OpenAI GPT-3.5 - Balanced performance"
            },
            "openai-gpt4": {
                "rate": settings.OPENAI_GPT4_CREDIT_RATE,
                "description": "OpenAI GPT-4 - Premium model"
            }
        },
        "default_user_credits": settings.DEFAULT_USER_CREDITS
    }