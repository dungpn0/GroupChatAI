from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class GroupMember(Base):
    __tablename__ = "group_members"
    
    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    group_id = Column(Integer, ForeignKey('chat_groups.id'), primary_key=True)
    joined_at = Column(DateTime, default=func.now())
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User")
    group = relationship("ChatGroup")


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    avatar_url = Column(String(500), nullable=True)
    
    # OAuth fields
    google_id = Column(String(100), unique=True, nullable=True)
    is_oauth = Column(Boolean, default=False)
    
    # Account status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Credit system
    credits = Column(Float, default=100.0)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    created_groups = relationship("ChatGroup", foreign_keys="ChatGroup.creator_id", overlaps="creator")
    group_memberships = relationship("GroupMember", foreign_keys="GroupMember.user_id", overlaps="user")
    messages = relationship("Message", foreign_keys="Message.user_id")
    credit_transactions = relationship("CreditTransaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class ChatGroup(Base):
    __tablename__ = "chat_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Group settings
    is_private = Column(Boolean, default=False)
    invite_code = Column(String(50), unique=True, nullable=True)
    max_members = Column(Integer, default=100)
    
    # AI settings
    ai_enabled = Column(Boolean, default=False)
    ai_model = Column(String(50), nullable=True)  # openai-gpt4, openai-gpt3.5, gemini
    
    # Creator
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Match database schema
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", foreign_keys="ChatGroup.creator_id", overlaps="created_groups")
    group_memberships = relationship("GroupMember", foreign_keys="GroupMember.group_id", overlaps="group")
    messages = relationship("Message", foreign_keys="Message.group_id")
    invitations = relationship("GroupInvitation", foreign_keys="GroupInvitation.group_id")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    
    # Message metadata - match database schema
    message_type = Column(String(50), nullable=True)
    is_ai_message = Column(Boolean, default=False)
    ai_model_used = Column(String(50), nullable=True)
    credits_used = Column(Float, nullable=True)
    
    # References - match database schema
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL for AI messages  
    group_id = Column(Integer, ForeignKey("chat_groups.id"), nullable=False)
    reply_to_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="messages")
    group = relationship("ChatGroup", back_populates="messages")
    reply_to = relationship("Message", remote_side=[id])


class GroupInvitation(Base):
    __tablename__ = "group_invitations"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    invitation_code = Column(String(100), unique=True, nullable=False)
    
    # Status
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    
    # References
    group_id = Column(Integer, ForeignKey("chat_groups.id"), nullable=False)
    invited_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    used_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    used_at = Column(DateTime, nullable=True)
    
    # Relationships
    group = relationship("ChatGroup", back_populates="invitations")
    invited_by = relationship("User", foreign_keys=[invited_by_id])
    used_by = relationship("User", foreign_keys=[used_by_id])


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # group_invitation, group_message, system, etc.
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    data = Column(Text, nullable=True)  # JSON data for additional info
    
    # Status
    is_read = Column(Boolean, default=False)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    related_id = Column(Integer, nullable=True)  # ID của invitation, message, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20), nullable=False)  # purchase, usage, bonus, refund
    description = Column(String(500), nullable=True)
    
    # AI usage details
    ai_model = Column(String(50), nullable=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    
    # Payment details (for purchases)
    payment_id = Column(String(100), nullable=True)
    payment_status = Column(String(20), nullable=True)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    message = relationship("Message")