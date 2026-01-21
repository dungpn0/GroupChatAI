# Environment Setup for GroupChatAI

## Quick Setup for Docker Compose

1. **Setup Backend Environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys and secrets
   ```

2. **Setup Frontend Environment:**
   ```bash
   cp frontend/.env.production frontend/.env.production
   # Edit frontend/.env.production if needed (has good defaults)
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Manual Development Setup

### Backend Setup
1. Copy and edit backend environment:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your values
   ```

### Frontend Setup  
1. Copy and edit frontend environment:
   ```bash
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your values
   ```

## Required Variables

### Backend (.env)
- `OPENAI_API_KEY` - Your OpenAI API key
- `GOOGLE_GEMINI_API_KEY` - Your Google Gemini API key  
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - For Google OAuth

### Frontend (.env.local or .env.production)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `NEXTAUTH_SECRET` - Secret for NextAuth.js
- `NEXTAUTH_URL` - NextAuth callback URL

### Optional Feature Flags (Frontend)
- `NEXT_PUBLIC_ENABLE_AI_CHAT=true/false` - Enable/disable AI features
- `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true/false` - Enable/disable Google login
- `NEXT_PUBLIC_APP_NAME` - App name (default: GroupChatAI)

## Docker Compose Notes

- Uses `env_file` to load variables from respective `.env` files
- No need for root-level `.env` file
- Backend uses `backend/.env`
- Frontend uses `frontend/.env.production`
- Database and Redis URLs are automatically configured for Docker network