# GroupChatAI

A modern group chat application with AI integration, featuring real-time messaging, AI chatbot participants, and a credit-based system.

## Features

- **User Authentication**: Email/Password and Google OAuth
- **Group Chat Management**: Create, join, and manage chat groups
- **AI Integration**: AI chatbots with multiple LLM models (OpenAI, Gemini)
- **Credit System**: Pay-per-use AI responses with configurable rates
- **Real-time Messaging**: WebSocket-based live chat
- **Invitation System**: Invite members via link or email
- **Professional UI**: Modern, responsive chat interface

## Tech Stack

- **Frontend**: NextJS 14, TypeScript, Tailwind CSS, Socket.IO
- **Backend**: Python FastAPI, LangChain, SQLAlchemy, WebSockets
- **Database**: PostgreSQL, Redis
- **Authentication**: NextAuth.js, JWT
- **Deployment**: Docker, Docker Compose

## Quick Start

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. **Configure Google OAuth** (optional):
   - Follow the [Google OAuth Setup Guide](./docs/google-oauth-setup.md)
   - Update `.env` with your Google credentials
4. Fill in your API keys and secrets in `.env`
5. Start with Docker:
   ```bash
   docker-compose up --build
   ```
5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose

### Docker Development

#### 🚀 Production Mode (Recommended for demo/staging)
```bash
# Build and start all services in production mode
docker-compose up --build -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Features:**
- ✅ Optimized production builds
- ✅ Secure (databases not exposed externally)
- ✅ Fast performance
- ✅ External access via `http://<server-ip>:3000`

**Services accessible externally:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

#### 🌐 External Access / VPN Deployment
```bash
# Copy environment template for external access
cp .env.production .env

# Update your server IP in .env file
EXTERNAL_IP=10.8.0.3  # Your server's external IP
NEXT_PUBLIC_API_URL=http://10.8.0.3:8000
NEXTAUTH_URL=http://10.8.0.3:3000

# Deploy with external access
docker-compose build --no-cache
docker-compose up -d

# Access via external IP
# Frontend: http://10.8.0.3:3000
# Backend:  http://10.8.0.3:8000
```

#### 🔧 Development Mode (Hot reload)
```bash
# Build and start in development mode with hot reload
docker-compose -f docker-compose.dev.yml up --build -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

**Features:**
- ✅ Hot reload for code changes
- ✅ Source code mounted for live editing
- ✅ Database and Redis exposed for debugging
- ✅ Development optimized builds

**Additional development access:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

#### 🔄 Switching Between Modes
```bash
# Switch from production to development
docker-compose down
docker-compose -f docker-compose.dev.yml up -d

# Switch from development to production  
docker-compose -f docker-compose.dev.yml down
docker-compose up -d

# Clean rebuild (if dependencies changed)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 🐛 Troubleshooting
```bash
# View specific container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# Reset all data (⚠️ Will delete database data)
docker-compose down -v
docker-compose up --build -d

# Enter container for debugging
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Native Development (Alternative to Docker)

#### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/                # Python FastAPI backend
│   ├── app/               # Application code
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── main.py       # FastAPI app
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile        # Backend container
├── frontend/              # NextJS frontend
│   ├── components/       # React components
│   ├── pages/           # Next.js pages
│   ├── lib/             # Utilities and services
│   ├── styles/          # CSS and Tailwind
│   ├── package.json     # Node dependencies
│   └── Dockerfile       # Frontend container
├── docs/                 # Documentation
├── docker-compose.yml    # Multi-service setup
└── README.md            # This file
```

## Documentation

See the [docs](./docs) folder for detailed documentation:
- [API Documentation](./docs/api.md)
- [Google OAuth Setup](./docs/google-oauth-setup.md)
- [Development Setup Guide](./docs/development-setup.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [User Guide](./docs/user-guide.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.