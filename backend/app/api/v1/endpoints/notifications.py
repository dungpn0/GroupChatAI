from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User
from app.schemas.notification import NotificationResponse, NotificationSummary, NotificationUpdate
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=NotificationSummary)
async def get_notifications(
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user notifications"""
    notification_service = NotificationService(db)
    
    # Get notifications
    notifications = await notification_service.get_user_notifications(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        unread_only=unread_only
    )
    
    # Get counts
    counts = await notification_service.get_notification_counts(current_user.id)
    
    # Convert notifications to response format
    notification_responses = []
    for notification in notifications:
        data = None
        if notification.data:
            import json
            try:
                data = json.loads(notification.data)
            except:
                data = None
                
        notification_responses.append(NotificationResponse(
            id=notification.id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            data=data,
            user_id=notification.user_id,
            related_id=notification.related_id,
            is_read=notification.is_read,
            created_at=notification.created_at,
            read_at=notification.read_at
        ))
    
    return NotificationSummary(
        total_count=counts["total_count"],
        unread_count=counts["unread_count"],
        notifications=notification_responses
    )


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a notification as read"""
    notification_service = NotificationService(db)
    
    notification = await notification_service.mark_notification_as_read(
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read"""
    notification_service = NotificationService(db)
    
    updated_count = await notification_service.mark_all_as_read(current_user.id)
    
    return {"message": f"Marked {updated_count} notifications as read"}


@router.get("/count")
async def get_notification_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification counts"""
    notification_service = NotificationService(db)
    counts = await notification_service.get_notification_counts(current_user.id)
    return counts