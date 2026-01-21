from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
from pydantic import ValidationError

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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle pydantic validation errors"""
    # Extract the first error message for better user experience
    error_detail = exc.errors()[0]
    field_name = error_detail.get('loc', ['unknown'])[-1]
    error_msg = error_detail.get('msg', 'Validation error')
    
    # Handle custom validation messages (like our password validation)
    if error_detail.get('type') == 'value_error':
        error_msg = str(error_detail.get('ctx', {}).get('message', error_msg))
    
    return JSONResponse(
        status_code=422,
        content={"detail": f"{error_msg}"}
    )


@app.exception_handler(ValidationError)  
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """Handle pydantic ValidationError"""
    error_detail = exc.errors()[0] 
    error_msg = error_detail.get('msg', 'Validation error')
    
    return JSONResponse(
        status_code=422,
        content={"detail": error_msg}
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