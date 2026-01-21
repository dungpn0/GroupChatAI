from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    data: Optional[dict] = None


class NotificationCreate(NotificationBase):
    user_id: int
    related_id: Optional[int] = None


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    related_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationSummary(BaseModel):
    total_count: int
    unread_count: int
    notifications: list[NotificationResponse]