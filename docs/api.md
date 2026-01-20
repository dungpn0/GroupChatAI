# GroupChatAI API Documentation

## Overview

The GroupChatAI API is built with FastAPI and provides RESTful endpoints for managing users, groups, messages, and credits. It also includes WebSocket support for real-time chat functionality.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication (`/api/v1/auth`)

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "Full Name (optional)"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "avatar_url": null,
  "is_active": true,
  "is_verified": false,
  "credits": 100.0,
  "created_at": "2026-01-20T10:00:00Z",
  "last_login": null
}
```

#### POST `/api/v1/auth/login`
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "full_name": "Full Name",
    "avatar_url": null,
    "is_active": true,
    "is_verified": false,
    "credits": 100.0,
    "created_at": "2026-01-20T10:00:00Z",
    "last_login": "2026-01-20T10:30:00Z"
  }
}
```

#### POST `/api/v1/auth/google`
Authenticate user with Google OAuth token.

**Request Body:**
```json
{
  "google_token": "google_oauth_token_here"
}
```

**Response:** Same as login endpoint.

#### GET `/api/v1/auth/me`
Get current user profile (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "avatar_url": null,
  "is_active": true,
  "is_verified": false,
  "credits": 95.5,
  "created_at": "2026-01-20T10:00:00Z",
  "last_login": "2026-01-20T10:30:00Z"
}
```

### Groups (`/api/v1/groups`)

#### GET `/api/v1/groups`
Get user's groups.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Page size (default: 20)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "General Chat",
      "description": "General discussion group",
      "avatar_url": null,
      "invite_code": "abc123xyz",
      "is_private": false,
      "ai_enabled": true,
      "ai_model": "openai-gpt4",
      "max_members": 100,
      "creator_id": 1,
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T10:00:00Z",
      "member_count": 5
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

#### POST `/api/v1/groups`
Create a new group.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Group",
  "description": "Group description",
  "is_private": false,
  "max_members": 100,
  "ai_enabled": true,
  "ai_model": "gemini"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Group",
  "description": "Group description",
  "avatar_url": null,
  "invite_code": "def456uvw",
  "is_private": false,
  "ai_enabled": true,
  "ai_model": "gemini",
  "max_members": 100,
  "creator_id": 1,
  "created_at": "2026-01-20T11:00:00Z",
  "updated_at": "2026-01-20T11:00:00Z",
  "member_count": 1
}
```

#### GET `/api/v1/groups/{group_id}`
Get group details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "General Chat",
  "description": "General discussion group",
  "avatar_url": null,
  "invite_code": "abc123xyz",
  "is_private": false,
  "ai_enabled": true,
  "ai_model": "openai-gpt4",
  "max_members": 100,
  "creator_id": 1,
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-01-20T10:00:00Z",
  "member_count": 5,
  "members": [
    {
      "id": 1,
      "username": "creator",
      "full_name": "Creator Name",
      "avatar_url": null,
      "is_admin": true,
      "joined_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

#### PUT `/api/v1/groups/{group_id}`
Update group settings (admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Group Name",
  "description": "Updated description",
  "ai_enabled": false,
  "ai_model": null
}
```

#### POST `/api/v1/groups/{group_id}/join`
Join group by invite code.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "invite_code": "abc123xyz"
}
```

#### POST `/api/v1/groups/{group_id}/invite`
Invite user to group by email.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "newuser@example.com",
  "invitation_code": "inv_123abc456",
  "group_id": 1,
  "invited_by_id": 1,
  "is_used": false,
  "expires_at": "2026-01-27T10:00:00Z",
  "created_at": "2026-01-20T10:00:00Z"
}
```

### Messages (`/api/v1/messages`)

#### GET `/api/v1/messages`
Get messages for a group.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `group_id`: Group ID (required)
- `page`: Page number (default: 1)
- `size`: Page size (default: 50)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "content": "Hello everyone!",
      "message_type": "text",
      "is_ai_message": false,
      "ai_model_used": null,
      "credits_used": null,
      "user_id": 1,
      "group_id": 1,
      "reply_to_id": null,
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-01-20T10:00:00Z",
      "user": {
        "id": 1,
        "username": "user1",
        "full_name": "User One",
        "avatar_url": null
      }
    }
  ],
  "total": 1,
  "page": 1,
  "size": 50,
  "pages": 1
}
```

#### POST `/api/v1/messages`
Send a new message.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Hello world!",
  "group_id": 1,
  "message_type": "text",
  "reply_to_id": null
}
```

**Response:**
```json
{
  "id": 2,
  "content": "Hello world!",
  "message_type": "text",
  "is_ai_message": false,
  "ai_model_used": null,
  "credits_used": null,
  "user_id": 1,
  "group_id": 1,
  "reply_to_id": null,
  "created_at": "2026-01-20T10:05:00Z",
  "updated_at": "2026-01-20T10:05:00Z"
}
```

### Credits (`/api/v1/credits`)

#### GET `/api/v1/credits/balance`
Get user's credit balance.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user_id": 1,
  "credits": 95.5,
  "last_updated": "2026-01-20T10:00:00Z"
}
```

#### GET `/api/v1/credits/transactions`
Get user's credit transaction history.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Page size (default: 20)
- `transaction_type`: Filter by type (purchase, usage, bonus, refund)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "amount": -0.2,
      "transaction_type": "usage",
      "description": "AI response using GPT-4",
      "ai_model": "openai-gpt4",
      "message_id": 5,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

#### POST `/api/v1/credits/purchase`
Purchase credits.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "package": "basic",
  "payment_method": "credit_card",
  "payment_token": "stripe_payment_token"
}
```

**Response:**
```json
{
  "transaction_id": "txn_123abc456",
  "credits_added": 100,
  "amount_paid": 5.00,
  "new_balance": 195.5,
  "status": "completed"
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoint with JWT token:

```
ws://localhost:8000/ws/{jwt_token}
```

### Message Types

#### Join Group
```json
{
  "type": "join_group",
  "group_id": 1
}
```

#### Leave Group
```json
{
  "type": "leave_group",
  "group_id": 1
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "group_id": 1
}
```

#### Stop Typing
```json
{
  "type": "stop_typing",
  "group_id": 1
}
```

### Server Events

#### New Message
```json
{
  "type": "new_message",
  "message": {
    "id": 3,
    "content": "New message content",
    "user_id": 2,
    "group_id": 1,
    "created_at": "2026-01-20T10:10:00Z",
    "user": {
      "id": 2,
      "username": "user2",
      "avatar_url": null
    }
  }
}
```

#### User Typing
```json
{
  "type": "user_typing",
  "user_id": 2,
  "group_id": 1
}
```

#### AI Response
```json
{
  "type": "ai_response",
  "message": {
    "id": 4,
    "content": "AI generated response",
    "is_ai_message": true,
    "ai_model_used": "openai-gpt4",
    "credits_used": 0.2,
    "group_id": 1,
    "created_at": "2026-01-20T10:11:00Z"
  },
  "credits_remaining": 95.3
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2026-01-20T10:00:00Z"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Rate Limited
- `500`: Internal Server Error

### Error Codes

- `INVALID_CREDENTIALS`: Login failed
- `USER_EXISTS`: Email/username already taken
- `INSUFFICIENT_CREDITS`: Not enough credits for AI operation
- `GROUP_NOT_FOUND`: Group doesn't exist or no access
- `PERMISSION_DENIED`: Operation requires higher privileges
- `RATE_LIMITED`: Too many requests

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **API endpoints**: 100 requests per minute
- **WebSocket messages**: 30 messages per minute

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (starts from 1)
- `size`: Items per page (max 100)

**Response includes:**
- `items`: Array of items
- `total`: Total number of items
- `page`: Current page
- `size`: Items per page
- `pages`: Total number of pages

## AI Integration

### Credit Costs

| Model | Cost per Response |
|-------|-------------------|
| Gemini | 0.1 credits |
| GPT-3.5 | 0.1 credits |
| GPT-4 | 0.2 credits |

### AI Response Flow

1. User sends message in AI-enabled group
2. System checks group AI settings
3. If AI enabled, deducts credits from group members (rotating)
4. Sends message to selected AI model
5. Broadcasts AI response via WebSocket
6. Records credit transaction

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json