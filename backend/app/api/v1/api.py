from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, groups, messages, credits, notifications


api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(messages.router, prefix="/messages", tags=["messages"])
api_router.include_router(credits.router, prefix="/credits", tags=["credits"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])