from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_groups():
    """Get user's groups (placeholder)"""
    return {"message": "Groups endpoint"}