from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.services.user_service import UserService
from app.models import User


security = HTTPBearer()


async def get_current_user(
    token: str = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from HTTPAuthorizationCredentials
        token_str = token.credentials if hasattr(token, 'credentials') else str(token)
        payload = verify_token(token_str)
        
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
    
    user_service = UserService(db)
    user = await user_service.get_user(user_id)
    
    if user is None:
        raise credentials_exception
        
    return user