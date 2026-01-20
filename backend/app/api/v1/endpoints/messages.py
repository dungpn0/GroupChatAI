from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_messages():
    """Get messages (placeholder)"""
    return {"message": "Messages endpoint"}