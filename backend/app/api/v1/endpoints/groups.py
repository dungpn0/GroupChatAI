from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User, ChatGroup, GroupMember, GroupInvitation
from sqlalchemy import and_
import uuid
from datetime import datetime

router = APIRouter()


class CreateGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None


class InviteUserRequest(BaseModel):
    email: str


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: str
    member_count: int
    is_owner: bool


@router.get("/", response_model=List[GroupResponse])
async def get_user_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get groups user belongs to"""
    groups = db.query(ChatGroup).join(GroupMember).filter(
        GroupMember.user_id == current_user.id
    ).all()
    
    result = []
    for group in groups:
        member_count = db.query(GroupMember).filter(
            GroupMember.group_id == group.id
        ).count()
        
        result.append(GroupResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            created_by=group.created_by,
            created_at=group.created_at.isoformat(),
            member_count=member_count,
            is_owner=group.created_by == current_user.id
        ))
    
    return result


@router.post("/", response_model=GroupResponse)
async def create_group(
    request: CreateGroupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new chat group"""
    # Create group
    new_group = ChatGroup(
        name=request.name,
        description=request.description,
        created_by=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(new_group)
    db.flush()  # Get the ID
    
    # Add creator as member
    membership = GroupMember(
        user_id=current_user.id,
        group_id=new_group.id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    db.commit()
    
    return GroupResponse(
        id=new_group.id,
        name=new_group.name,
        description=new_group.description,
        created_by=new_group.created_by,
        created_at=new_group.created_at.isoformat(),
        member_count=1,
        is_owner=True
    )


@router.post("/{group_id}/invite")
async def invite_user_to_group(
    group_id: int,
    request: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Invite user to group"""
    # Check if current user is in the group
    membership = db.query(GroupMember).filter(
        and_(
            GroupMember.user_id == current_user.id,
            GroupMember.group_id == group_id
        )
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Find user to invite
    user_to_invite = db.query(User).filter(User.email == request.email).first()
    if not user_to_invite:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing_member = db.query(GroupMember).filter(
        and_(
            GroupMember.user_id == user_to_invite.id,
            GroupMember.group_id == group_id
        )
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a member")
    
    # Create invitation
    invitation = GroupInvitation(
        group_id=group_id,
        invited_user_id=user_to_invite.id,
        invited_by=current_user.id,
        token=str(uuid.uuid4()),
        created_at=datetime.utcnow()
    )
    db.add(invitation)
    db.commit()
    
    return {
        "message": f"Invitation sent to {request.email}",
        "invitation_token": invitation.token
    }


@router.post("/join/{token}")
async def join_group_by_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join group using invitation token"""
    invitation = db.query(GroupInvitation).filter(
        and_(
            GroupInvitation.token == token,
            GroupInvitation.invited_user_id == current_user.id,
            GroupInvitation.accepted_at.is_(None)
        )
    ).first()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation")
    
    # Add user to group
    membership = GroupMember(
        user_id=current_user.id,
        group_id=invitation.group_id,
        joined_at=datetime.utcnow()
    )
    db.add(membership)
    
    # Mark invitation as accepted
    invitation.accepted_at = datetime.utcnow()
    db.commit()
    
    group = db.query(ChatGroup).filter(ChatGroup.id == invitation.group_id).first()
    
    return {
        "message": f"Successfully joined group '{group.name}'",
        "group_id": group.id,
        "group_name": group.name
    }