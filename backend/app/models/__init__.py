from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


# Association table for group members
group_members = Table(
    'group_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('chat_groups.id'), primary_key=True),
    Column('joined_at', DateTime, default=func.now()),
    Column('is_admin', Boolean, default=False)
)


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
    created_groups = relationship("ChatGroup", back_populates="creator")
    groups = relationship("ChatGroup", secondary=group_members, back_populates="members")
    messages = relationship("Message", back_populates="user")
    credit_transactions = relationship("CreditTransaction", back_populates="user")


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
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_groups")
    members = relationship("User", secondary=group_members, back_populates="groups")
    messages = relationship("Message", back_populates="group")
    invitations = relationship("GroupInvitation", back_populates="group")


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default="text")  # text, image, file, ai_response
    
    # Message metadata
    is_ai_message = Column(Boolean, default=False)
    ai_model_used = Column(String(50), nullable=True)
    credits_used = Column(Float, nullable=True)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
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