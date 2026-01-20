from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.sql import func
from app.models import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash
from app.core.config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password,
            credits=settings.DEFAULT_USER_CREDITS,
            is_oauth=False
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"Created new user: {user.email}")
        return user
    
    async def create_google_user(self, user_data: UserCreate, google_id: str, avatar_url: Optional[str] = None) -> User:
        """Create a new user from Google OAuth"""
        user = User(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            google_id=google_id,
            avatar_url=avatar_url,
            credits=settings.DEFAULT_USER_CREDITS,
            is_oauth=True,
            is_verified=True  # Google accounts are pre-verified
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        logger.info(f"Created new Google user: {user.email}")
        return user
    
    async def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        result = await self.db.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()
    
    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID"""
        result = await self.db.execute(select(User).where(User.google_id == google_id))
        return result.scalar_one_or_none()
    
    async def link_google_account(self, user_id: int, google_id: str) -> User:
        """Link Google account to existing user"""
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(google_id=google_id, is_oauth=True, is_verified=True)
        )
        await self.db.commit()
        
        user = await self.get_user_by_id(user_id)
        logger.info(f"Linked Google account to user: {user.email}")
        return user
    
    async def update_last_login(self, user_id: int):
        """Update user's last login timestamp"""
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_login=func.now())
        )
        await self.db.commit()
    
    async def update_user_credits(self, user_id: int, amount: float) -> User:
        """Update user's credits"""
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(credits=User.credits + amount)
        )
        await self.db.commit()
        
        return await self.get_user_by_id(user_id)
    
    async def deduct_credits(self, user_id: int, amount: float) -> bool:
        """Deduct credits from user account"""
        user = await self.get_user_by_id(user_id)
        if not user or user.credits < amount:
            return False
        
        await self.db.execute(
            update(User)
            .where(User.id == user_id)
            .values(credits=User.credits - amount)
        )
        await self.db.commit()
        
        return True