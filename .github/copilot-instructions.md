<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# GroupChatAI Project Instructions

## Project Overview
GroupChatAI is a group chat application with AI integration featuring:
- NextJS frontend with professional chat interface
- Python FastAPI backend with LangChain integration
- PostgreSQL database for data persistence
- Docker deployment configuration
- AI chatbot integration with credit system
- User authentication (email/password and Google OAuth)
- Group chat management and invitation system

## Development Guidelines

### Frontend (NextJS)
- Use TypeScript for type safety
- Implement responsive design with Tailwind CSS
- Real-time chat using WebSocket/Socket.IO
- State management with Zustand or Redux Toolkit
- Authentication handling with NextAuth.js

### Backend (Python FastAPI)
- Use FastAPI for REST API and WebSocket endpoints
- LangChain for AI model integration (OpenAI, Gemini)
- SQLAlchemy ORM for database operations
- Pydantic models for data validation
- JWT token authentication
- Credit system implementation

### Database (PostgreSQL)
- User management and authentication
- Chat groups and messages storage
- AI credit tracking and transactions
- Invitation system data

### AI Integration
- Support multiple LLM models (OpenAI GPT, Google Gemini)
- Credit-based usage system with configurable rates
- Real-time AI responses in group chats
- Admin-controlled chatbot activation

### Docker Configuration
- Multi-service setup with docker-compose
- Separate containers for frontend, backend, database
- Development and production environments
- Environment variable management

## Completed Steps
✅ Verified copilot-instructions.md file