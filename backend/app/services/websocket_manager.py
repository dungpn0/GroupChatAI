from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import logging
from app.core.security import verify_token
from app.services.user_service import UserService
from app.core.database import AsyncSessionLocal

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Store active connections: {user_id: {websockets}}
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # Store group connections: {group_id: {user_ids}}
        self.group_connections: Dict[int, Set[int]] = {}
    
    async def connect(self, websocket: WebSocket, token: str):
        """Connect a new WebSocket client"""
        await websocket.accept()
        
        try:
            # Verify token and get user
            payload = verify_token(token)
            user_id = int(payload.get("sub"))
            
            # Store connection
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
            
            logger.info(f"User {user_id} connected via WebSocket")
            
            # Send connection confirmation
            await websocket.send_text(json.dumps({
                "type": "connection_confirmed",
                "user_id": user_id
            }))
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            await websocket.close(code=4001)
    
    async def disconnect(self, websocket: WebSocket, token: str):
        """Disconnect a WebSocket client"""
        try:
            payload = verify_token(token)
            user_id = int(payload.get("sub"))
            
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            logger.info(f"User {user_id} disconnected from WebSocket")
            
        except Exception as e:
            logger.error(f"WebSocket disconnection error: {e}")
    
    async def join_group(self, user_id: int, group_id: int):
        """Join a user to a group for real-time updates"""
        if group_id not in self.group_connections:
            self.group_connections[group_id] = set()
        self.group_connections[group_id].add(user_id)
        
        logger.info(f"User {user_id} joined group {group_id} for real-time updates")
    
    async def leave_group(self, user_id: int, group_id: int):
        """Remove user from group real-time updates"""
        if group_id in self.group_connections:
            self.group_connections[group_id].discard(user_id)
            if not self.group_connections[group_id]:
                del self.group_connections[group_id]
        
        logger.info(f"User {user_id} left group {group_id}")
    
    async def send_to_user(self, user_id: int, message: dict):
        """Send message to a specific user"""
        if user_id in self.active_connections:
            disconnected = set()
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except:
                    disconnected.add(websocket)
            
            # Remove disconnected websockets
            for ws in disconnected:
                self.active_connections[user_id].discard(ws)
    
    async def send_to_group(self, group_id: int, message: dict, exclude_user: int = None):
        """Send message to all users in a group"""
        if group_id in self.group_connections:
            for user_id in self.group_connections[group_id]:
                if exclude_user and user_id == exclude_user:
                    continue
                await self.send_to_user(user_id, message)
    
    async def listen_for_messages(self, websocket: WebSocket, token: str):
        """Listen for incoming WebSocket messages"""
        try:
            payload = verify_token(token)
            user_id = int(payload.get("sub"))
            
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                await self.handle_message(user_id, message)
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected for user {user_id}")
        except Exception as e:
            logger.error(f"Error in WebSocket listener: {e}")
    
    async def handle_message(self, user_id: int, message: dict):
        """Handle incoming WebSocket messages"""
        message_type = message.get("type")
        
        if message_type == "join_group":
            group_id = message.get("group_id")
            if group_id:
                await self.join_group(user_id, group_id)
        
        elif message_type == "leave_group":
            group_id = message.get("group_id")
            if group_id:
                await self.leave_group(user_id, group_id)
        
        elif message_type == "typing":
            group_id = message.get("group_id")
            if group_id:
                await self.send_to_group(group_id, {
                    "type": "user_typing",
                    "user_id": user_id,
                    "group_id": group_id
                }, exclude_user=user_id)
        
        elif message_type == "stop_typing":
            group_id = message.get("group_id")
            if group_id:
                await self.send_to_group(group_id, {
                    "type": "user_stopped_typing",
                    "user_id": user_id,
                    "group_id": group_id
                }, exclude_user=user_id)


# Global connection manager instance
manager = ConnectionManager()