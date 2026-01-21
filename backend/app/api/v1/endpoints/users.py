from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, and_
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.user_service import UserService
from app.models import User

router = APIRouter()


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    credits: float
    is_active: bool
    is_verified: bool
    created_at: str
    last_login: Optional[str]


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        credits=current_user.credits,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at.isoformat(),
        last_login=current_user.last_login.isoformat() if current_user.last_login else None
    )


@router.get("/search")
async def search_users(
    query: str,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search users by email or username"""
    
    stmt = select(User).where(
        and_(
            or_(
                func.lower(User.email).contains(query.lower()),
                func.lower(User.username).contains(query.lower()),
                func.lower(User.full_name).contains(query.lower())
            ),
            User.id != current_user.id,  # Exclude current user
            User.is_active == True
        )
    ).limit(limit)
    
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name
            } for user in users
        ]
    }


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update current user's profile"""
    user_service = UserService(db)
    
    # Check if email or username already exists (if being changed)
    if request.email and request.email != current_user.email:
        existing_user = await user_service.get_user_by_email(request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    if request.username and request.username != current_user.username:
        existing_user = await user_service.get_user_by_username(request.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Update fields
    if request.username:
        current_user.username = request.username
    if request.full_name is not None:  # Allow empty string
        current_user.full_name = request.full_name
    if request.email:
        current_user.email = request.email
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        avatar_url=current_user.avatar_url,
        credits=current_user.credits,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at.isoformat(),
        last_login=current_user.last_login.isoformat() if current_user.last_login else None
    )