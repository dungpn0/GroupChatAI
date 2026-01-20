from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_credits():
    """Get credit information (placeholder)"""
    return {"message": "Credits endpoint"}