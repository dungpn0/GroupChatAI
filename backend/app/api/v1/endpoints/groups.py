from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, func
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User, ChatGroup, GroupMember, GroupInvitation, Message
from app.services.notification_service import NotificationService
from app.services.email_service import email_service
from app.services.websocket_manager import manager
import uuid

router = APIRouter()


class CreateGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: Optional[bool] = False
    ai_enabled: Optional[bool] = False
    ai_model: Optional[str] = None


class InviteUserRequest(BaseModel):
    email: str


class SendMessageRequest(BaseModel):
    content: str


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int  # API sẽ trả về created_by
    created_at: str
    member_count: int
    is_owner: bool
    is_private: bool
    ai_enabled: bool
    ai_model: Optional[str]


class MessageResponse(BaseModel):
    id: int
    content: str
    user_id: Optional[int]  # Match database field
    sender_username: Optional[str]
    is_ai_message: bool  # Match database field
    ai_model_used: Optional[str]  # Match database field
    created_at: str


@router.get("/", response_model=List[GroupResponse])
async def get_user_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get groups user belongs to"""
    # Query groups where user is member
    stmt = select(ChatGroup).join(GroupMember).where(
        GroupMember.user_id == current_user.id
    )
    result_groups = await db.execute(stmt)
    groups = result_groups.scalars().all()
    
    result = []
    for group in groups:
        # Count members for each group
        count_stmt = select(func.count(GroupMember.user_id)).where(
            GroupMember.group_id == group.id
        )
        count_result = await db.execute(count_stmt)
        member_count = count_result.scalar()
        
        result.append(GroupResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            created_by=group.creator_id,
            created_at=group.created_at.isoformat(),
            member_count=member_count,
            is_owner=group.creator_id == current_user.id,
            is_private=group.is_private,
            ai_enabled=group.ai_enabled,
            ai_model=group.ai_model
        ))
    
    return result


@router.post("/", response_model=GroupResponse)
async def create_group(
    request: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat group"""
    # Create group
    new_group = ChatGroup(
        name=request.name,
        description=request.description,
        creator_id=current_user.id,
        is_private=request.is_private or False,
        ai_enabled=request.ai_enabled or False,
        ai_model=request.ai_model if request.ai_enabled else None,
        created_at=datetime.utcnow()
    )
    db.add(new_group)
    await db.flush()  # Get the ID
    
    # Add creator as member
    membership = GroupMember(
        user_id=current_user.id,
        group_id=new_group.id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    await db.commit()
    
    return GroupResponse(
        id=new_group.id,
        name=new_group.name,
        description=new_group.description,
        created_by=new_group.creator_id,
        created_at=new_group.created_at.isoformat(),
        member_count=1,
        is_owner=True,
        is_private=new_group.is_private,
        ai_enabled=new_group.ai_enabled,
        ai_model=new_group.ai_model
    )


@router.post("/{group_id}/invite")
async def invite_user_to_group(
    group_id: int,
    request: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Invite user to group"""
    # Check if current user is in the group
    membership_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == group_id
        )
    )
    membership_result = await db.execute(membership_stmt)
    membership = membership_result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Find user to invite
    user_stmt = select(User).where(User.email == request.email)
    user_result = await db.execute(user_stmt)
    user_to_invite = user_result.scalar_one_or_none()
    
    # Get group information for email
    group_stmt = select(ChatGroup).where(ChatGroup.id == group_id)
    group_result = await db.execute(group_stmt)
    group = group_result.scalar_one()
    
    # Create invitation regardless of whether user exists
    invitation = GroupInvitation(
        group_id=group_id,
        email=request.email,
        invited_by_id=current_user.id,
        invitation_code=str(uuid.uuid4()),
        expires_at=datetime.utcnow() + timedelta(days=7)  # 7 days expiry
    )
    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)
    
    if user_to_invite:
        # User exists - check if already a member
        existing_stmt = select(GroupMember).where(
            and_(
                GroupMember.user_id == user_to_invite.id,
                GroupMember.group_id == group_id
            )
        )
        existing_result = await db.execute(existing_stmt)
        existing_member = existing_result.scalar_one_or_none()
        
        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member")
        
        # Create notification for existing user
        notification_service = NotificationService(db)
        await notification_service.create_group_invitation_notification(
            user_id=user_to_invite.id,
            group_name=group.name,
            invited_by_name=current_user.full_name or current_user.username,
            invitation_id=invitation.id
        )
        
        # Also send email as backup
        await email_service.send_group_invitation_email(
            to_email=request.email,
            group_name=group.name,
            invited_by_name=current_user.full_name or current_user.username,
            invitation_code=invitation.invitation_code,
            user_exists=True
        )
        
        return {
            "message": f"Invitation sent to {request.email} (existing user)",
            "invitation_token": invitation.invitation_code,
            "user_exists": True
        }
    else:
        # User doesn't exist - send email invitation to register and join
        await email_service.send_group_invitation_email(
            to_email=request.email,
            group_name=group.name,
            invited_by_name=current_user.full_name or current_user.username,
            invitation_code=invitation.invitation_code,
            user_exists=False
        )
        
        return {
            "message": f"Invitation email sent to {request.email} (new user)",
            "invitation_token": invitation.invitation_code,
            "user_exists": False
        }


@router.post("/join/{invitation_code}")
async def join_group_by_invitation(
    invitation_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Join group using invitation code"""
    invitation_stmt = select(GroupInvitation).where(
        and_(
            GroupInvitation.invitation_code == invitation_code,
            GroupInvitation.email == current_user.email,
            GroupInvitation.is_used == False,
            GroupInvitation.expires_at > datetime.utcnow()
        )
    )
    invitation_result = await db.execute(invitation_stmt)
    invitation = invitation_result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
    
    # Check if already a member
    existing_member_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == invitation.group_id
        )
    )
    existing_result = await db.execute(existing_member_stmt)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already a member of this group")
    
    # Add user to group
    membership = GroupMember(
        user_id=current_user.id,
        group_id=invitation.group_id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    
    # Mark invitation as used
    invitation.is_used = True
    invitation.used_at = datetime.utcnow()
    invitation.used_by_id = current_user.id
    await db.commit()
    
    group_stmt = select(ChatGroup).where(ChatGroup.id == invitation.group_id)
    group_result = await db.execute(group_stmt)
    group = group_result.scalar_one()
    
    return {
        "message": f"Successfully joined group '{group.name}'",
        "group_id": group.id,
        "group_name": group.name
    }


@router.post("/invitations/{invitation_id}/accept")
async def accept_group_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept group invitation by invitation ID"""
    invitation_stmt = select(GroupInvitation).where(
        and_(
            GroupInvitation.id == invitation_id,
            GroupInvitation.email == current_user.email,
            GroupInvitation.is_used == False,
            GroupInvitation.expires_at > datetime.utcnow()
        )
    )
    invitation_result = await db.execute(invitation_stmt)
    invitation = invitation_result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
    
    # Check if already a member
    existing_member_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == invitation.group_id
        )
    )
    existing_result = await db.execute(existing_member_stmt)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already a member of this group")
    
    # Add user to group
    membership = GroupMember(
        user_id=current_user.id,
        group_id=invitation.group_id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    
    # Mark invitation as used
    invitation.is_used = True
    invitation.used_at = datetime.utcnow()
    invitation.used_by_id = current_user.id
    
    await db.commit()
    
    # Get group info
    group_stmt = select(ChatGroup).where(ChatGroup.id == invitation.group_id)
    group_result = await db.execute(group_stmt)
    group = group_result.scalar_one()
    
    return {
        "message": f"Successfully joined group '{group.name}'",
        "group_id": group.id,
        "group_name": group.name
    }


@router.get("/invitations/check/{invitation_code}")
async def check_invitation(
    invitation_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Check if invitation code is valid"""
    invitation_stmt = select(GroupInvitation).where(
        and_(
            GroupInvitation.invitation_code == invitation_code,
            GroupInvitation.is_used == False,
            GroupInvitation.expires_at > datetime.utcnow()
        )
    )
    invitation_result = await db.execute(invitation_stmt)
    invitation = invitation_result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
    
    # Get group info
    group_stmt = select(ChatGroup).where(ChatGroup.id == invitation.group_id)
    group_result = await db.execute(group_stmt)
    group = group_result.scalar_one()
    
    # Get invited by user info
    invited_by_stmt = select(User).where(User.id == invitation.invited_by_id)
    invited_by_result = await db.execute(invited_by_stmt)
    invited_by = invited_by_result.scalar_one()
    
    return {
        "group_id": group.id,
        "group_name": group.name,
        "invited_by": invited_by.full_name or invited_by.username,
        "invited_email": invitation.email,
        "expires_at": invitation.expires_at.isoformat(),
        "valid": True
    }


@router.post("/invitations/{invitation_code}/join")
async def join_group_by_code(
    invitation_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Join group using invitation code (for new users who just registered)"""
    invitation_stmt = select(GroupInvitation).where(
        and_(
            GroupInvitation.invitation_code == invitation_code,
            GroupInvitation.email == current_user.email,
            GroupInvitation.is_used == False,
            GroupInvitation.expires_at > datetime.utcnow()
        )
    )
    invitation_result = await db.execute(invitation_stmt)
    invitation = invitation_result.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
    
    # Check if already a member
    existing_member_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == invitation.group_id
        )
    )
    existing_result = await db.execute(existing_member_stmt)
    if existing_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You are already a member of this group")
    
    # Add user to group
    membership = GroupMember(
        user_id=current_user.id,
        group_id=invitation.group_id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    
    # Mark invitation as used
    invitation.is_used = True
    invitation.used_at = datetime.utcnow()
    invitation.used_by_id = current_user.id
    
    await db.commit()
    
    # Get group info
    group_stmt = select(ChatGroup).where(ChatGroup.id == invitation.group_id)
    group_result = await db.execute(group_stmt)
    group = group_result.scalar_one()
    
    return {
        "message": f"Successfully joined group '{group.name}' using invitation code",
        "group_id": group.id,
        "group_name": group.name
    }


@router.get("/{group_id}/messages", response_model=List[MessageResponse])
async def get_group_messages(
    group_id: int,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages from a specific group"""
    # Check if user is member of group
    membership_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == group_id
        )
    )
    membership_result = await db.execute(membership_stmt)
    membership = membership_result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Get messages
    messages_stmt = select(Message).join(User, Message.user_id == User.id, isouter=True).where(
        Message.group_id == group_id
    ).order_by(Message.created_at.desc()).limit(limit).offset(offset)
    
    messages_result = await db.execute(messages_stmt)
    messages = messages_result.scalars().all()
    
    result = []
    for msg in messages:
        # Get sender info if exists
        sender_username = None
        if msg.user_id:
            sender_stmt = select(User).where(User.id == msg.user_id)
            sender_result = await db.execute(sender_stmt)
            sender = sender_result.scalar_one_or_none()
            if sender:
                sender_username = sender.username
        
        result.append(MessageResponse(
            id=msg.id,
            content=msg.content,
            user_id=msg.user_id,
            sender_username=sender_username,
            is_ai_message=msg.is_ai_message,
            ai_model_used=msg.ai_model_used,
            created_at=msg.created_at.isoformat()
        ))
    
    return result


@router.post("/{group_id}/messages", response_model=MessageResponse)
async def send_message_to_group(
    group_id: int,
    request: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to a group"""
    # Check if user is member of group
    membership_stmt = select(GroupMember).where(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == group_id
        )
    )
    membership_result = await db.execute(membership_stmt)
    membership = membership_result.scalar_one_or_none()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Create message
    new_message = Message(
        content=request.content,
        user_id=current_user.id,
        group_id=group_id,
        is_ai_message=False,
        created_at=datetime.utcnow()
    )
    
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)

    # Broadcast new message to group members via WebSocket
    print(f"Broadcasting new_message to group {group_id}")
    await manager.send_to_group(group_id, {
        "type": "new_message",
        "message": {
            "id": new_message.id,
            "content": new_message.content,
            "user_id": new_message.user_id,
            "user_email": current_user.email,
            "group_id": new_message.group_id,
            "created_at": new_message.created_at.isoformat() if new_message.created_at else None,
        }
    }, exclude_user_id=current_user.id)

    return MessageResponse(
        id=new_message.id,
        content=new_message.content,
        user_id=new_message.user_id,
        sender_username=current_user.username,
        is_ai_message=new_message.is_ai_message,
        ai_model_used=new_message.ai_model_used,
        created_at=new_message.created_at.isoformat()
    )