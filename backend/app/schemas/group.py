from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ChatGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False
    max_members: int = 100


class ChatGroupCreate(ChatGroupBase):
    ai_enabled: bool = False
    ai_model: Optional[str] = None


class ChatGroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None
    ai_enabled: Optional[bool] = None
    ai_model: Optional[str] = None
    max_members: Optional[int] = None


class ChatGroupMember(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: bool
    joined_at: datetime
    
    class Config:
        from_attributes = True


class ChatGroupResponse(ChatGroupBase):
    id: int
    avatar_url: Optional[str] = None
    invite_code: Optional[str] = None
    ai_enabled: bool
    ai_model: Optional[str] = None
    creator_id: int
    created_at: datetime
    updated_at: datetime
    member_count: int
    members: Optional[List[ChatGroupMember]] = None
    
    class Config:
        from_attributes = True


class GroupInviteCreate(BaseModel):
    email: str
    group_id: int


class GroupInviteResponse(BaseModel):
    id: int
    email: str
    invitation_code: str
    group_id: int
    invited_by_id: int
    is_used: bool
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True