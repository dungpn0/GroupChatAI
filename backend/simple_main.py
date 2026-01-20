from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(
    title="GroupChatAI API",
    description="A simple group chat application with AI integration",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple data models
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: str = None

class User(BaseModel):
    id: int
    email: str
    username: str
    full_name: str = None
    credits: float
    is_active: bool = True
    is_verified: bool = False
    created_at: str = "2024-01-01T00:00:00"

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Mock database
mock_users = [
    {
        "id": 1,
        "email": "admin@groupchatai.com",
        "username": "admin",
        "full_name": "Admin User",
        "password": "admin123",  # In real app, this would be hashed
        "credits": 100.0,
        "is_active": True,
        "is_verified": True,
        "created_at": "2024-01-01T00:00:00"
    }
]

@app.get("/")
async def root():
    return {
        "message": "GroupChatAI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GroupChatAI API"}

@app.post("/api/v1/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Simple authentication (demo only)
    for user in mock_users:
        if user["email"] == user_data.email and user["password"] == user_data.password:
            return Token(
                access_token="demo_token_123456",
                token_type="bearer",
                user=User(
                    id=user["id"],
                    email=user["email"],
                    username=user["username"],
                    full_name=user["full_name"],
                    credits=user["credits"],
                    is_active=user["is_active"],
                    is_verified=user["is_verified"],
                    created_at=user["created_at"]
                )
            )
    
    from fastapi import HTTPException, status
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password"
    )

@app.post("/api/v1/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if user exists
    for user in mock_users:
        if user["email"] == user_data.email:
            from fastapi import HTTPException, status
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    new_user = {
        "id": len(mock_users) + 1,
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "password": user_data.password,  # In real app, this would be hashed
        "credits": 100.0,
        "is_active": True,
        "is_verified": False,
        "created_at": "2024-01-01T00:00:00"
    }
    mock_users.append(new_user)
    
    return User(
        id=new_user["id"],
        email=new_user["email"],
        username=new_user["username"],
        full_name=new_user["full_name"],
        credits=new_user["credits"],
        is_active=new_user["is_active"],
        is_verified=new_user["is_verified"],
        created_at=new_user["created_at"]
    )

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user():
    # Return first user for demo
    user = mock_users[0]
    return User(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        credits=user["credits"],
        is_active=user["is_active"],
        is_verified=user["is_verified"],
        created_at=user["created_at"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)