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
3. Fill in your API keys and secrets in `.env`
4. Start with Docker:
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

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
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