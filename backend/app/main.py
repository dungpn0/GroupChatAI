from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.api import api_router
from app.services.websocket_manager import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("Starting up GroupChatAI application...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logging.info("Database tables created successfully")
    
    yield
    
    # Shutdown
    logging.info("Shutting down GroupChatAI application...")


app = FastAPI(
    title="GroupChatAI API",
    description="A group chat application with AI integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time chat"""
    try:
        await manager.connect(websocket, token)
        await manager.listen_for_messages(websocket, token)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, token)
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        await manager.disconnect(websocket, token)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GroupChatAI API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "GroupChatAI API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )