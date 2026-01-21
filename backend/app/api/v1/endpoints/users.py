from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.user_service import UserService
from app.models import User

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    credits: float
    is_active: bool
    created_at: str


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        credits=current_user.credits,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat()
    )


@router.get("/search")
async def search_users(
    query: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search users by email or name"""
    from sqlalchemy import or_, func, and_
    
    users = db.query(User).filter(
        and_(
            or_(
                func.lower(User.email).contains(query.lower()),
                func.lower(User.full_name).contains(query.lower())
            ),
            User.id != current_user.id,  # Exclude current user
            User.is_active == True
        )
    ).limit(limit).all()
    
    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name
            } for user in users
        ]
    }