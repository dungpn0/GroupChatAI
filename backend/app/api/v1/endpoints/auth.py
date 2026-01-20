from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, verify_token
from app.models import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import UserService
from sqlalchemy import select
import logging

router = APIRouter()
security = HTTPBearer()

logger = logging.getLogger(__name__)


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user"""
    user_service = UserService(db)
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await user_service.get_user_by_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    user = await user_service.create_user(user_data)
    return user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return access token"""
    user_service = UserService(db)
    
    # Get user by email
    user = await user_service.get_user_by_email(user_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not user.hashed_password or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    # Update last login
    await user_service.update_last_login(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/google", response_model=Token)
async def google_auth(google_token: str, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google OAuth"""
    # This would typically verify the Google token with Google's servers
    # For now, this is a placeholder implementation
    # In production, use google-auth library to verify the token
    
    user_service = UserService(db)
    
    # Extract user info from Google token (placeholder)
    # google_user_info = verify_google_token(google_token)
    
    # For demo purposes, create a mock response
    # In real implementation, parse the actual Google user info
    google_user_info = {
        "email": "user@gmail.com",
        "name": "Google User",
        "picture": "https://example.com/avatar.jpg",
        "sub": "google_user_id_123"
    }
    
    # Check if user exists
    user = await user_service.get_user_by_google_id(google_user_info["sub"])
    
    if not user:
        # Check if email exists
        existing_user = await user_service.get_user_by_email(google_user_info["email"])
        if existing_user:
            # Link Google account to existing user
            user = await user_service.link_google_account(existing_user.id, google_user_info["sub"])
        else:
            # Create new user
            user_create = UserCreate(
                email=google_user_info["email"],
                username=google_user_info["email"].split("@")[0],
                full_name=google_user_info["name"]
            )
            user = await user_service.create_google_user(user_create, google_user_info["sub"], google_user_info.get("picture"))
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    # Update last login
    await user_service.update_last_login(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user_service = UserService(db)
    user = await user_service.get_user_by_id(int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh access token"""
    access_token = create_access_token(data={"sub": str(current_user.id), "email": current_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": current_user
    }