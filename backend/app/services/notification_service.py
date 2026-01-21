from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from sqlalchemy.sql import func
from app.models import Notification, User
from app.schemas.notification import NotificationCreate, NotificationUpdate
from typing import Optional, List
import json
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_notification(self, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        notification = Notification(
            type=notification_data.type,
            title=notification_data.title,
            message=notification_data.message,
            data=json.dumps(notification_data.data) if notification_data.data else None,
            user_id=notification_data.user_id,
            related_id=notification_data.related_id
        )
        
        self.db.add(notification)
        await self.db.commit()
        await self.db.refresh(notification)
        
        logger.info(f"Created notification for user {notification_data.user_id}: {notification_data.title}")
        return notification
    
    async def get_user_notifications(
        self, 
        user_id: int, 
        limit: int = 20, 
        offset: int = 0, 
        unread_only: bool = False
    ) -> List[Notification]:
        """Get notifications for a user"""
        stmt = select(Notification).where(Notification.user_id == user_id)
        
        if unread_only:
            stmt = stmt.where(Notification.is_read == False)
        
        stmt = stmt.order_by(desc(Notification.created_at)).offset(offset).limit(limit)
        
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def get_notification_counts(self, user_id: int) -> dict:
        """Get notification counts for a user"""
        # Total count
        total_stmt = select(func.count()).select_from(Notification).where(Notification.user_id == user_id)
        total_result = await self.db.execute(total_stmt)
        total_count = total_result.scalar() or 0
        
        # Unread count  
        unread_stmt = select(func.count()).select_from(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        )
        unread_result = await self.db.execute(unread_stmt)
        unread_count = unread_result.scalar() or 0
        
        return {
            "total_count": total_count,
            "unread_count": unread_count
        }
    
    async def mark_notification_as_read(self, notification_id: int, user_id: int) -> Optional[Notification]:
        """Mark a notification as read"""
        stmt = select(Notification).where(
            and_(
                Notification.id == notification_id,
                Notification.user_id == user_id
            )
        )
        result = await self.db.execute(stmt)
        notification = result.scalar_one_or_none()
        
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = func.now()
            await self.db.commit()
            await self.db.refresh(notification)
        
        return notification
    
    async def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user"""
        from sqlalchemy import update
        
        stmt = update(Notification).where(
            and_(
                Notification.user_id == user_id,
                Notification.is_read == False
            )
        ).values(
            is_read=True,
            read_at=func.now()
        )
        
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount
    
    async def create_group_invitation_notification(
        self, 
        user_id: int, 
        group_name: str, 
        invited_by_name: str, 
        invitation_id: int
    ) -> Notification:
        """Create notification for group invitation"""
        notification_data = NotificationCreate(
            type="group_invitation",
            title="Group Invitation",
            message=f"{invited_by_name} invited you to join '{group_name}'",
            data={
                "invitation_id": invitation_id,
                "group_name": group_name,
                "invited_by": invited_by_name,
                "action": "join_group"
            },
            user_id=user_id,
            related_id=invitation_id
        )
        
        return await self.create_notification(notification_data)