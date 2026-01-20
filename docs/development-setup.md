# Development Setup Guide

## Environment Configuration

### File Structure
```
groupchatai/
├── .env.example           # Template with all variables
├── backend/
│   ├── .env.example      # Backend-specific template  
│   ├── .env              # Backend development config
│   └── .env.production   # Backend production config
├── frontend/
│   ├── .env.example      # Frontend-specific template
│   ├── .env.local        # Frontend development config
│   └── .env.production   # Frontend production config
└── docker-compose.yml    # Uses env_file: backend/.env and frontend/.env.local
```

### Setup Steps

1. **Copy environment templates:**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit backend/.env with your database URL, JWT secret, API keys
   
   # Frontend environment  
   cd ../frontend
   cp .env.example .env.local
   # Edit frontend/.env.local with your API URL, Google client ID
   ```

2. **Fill in actual values** - never commit real secrets to git

---

## 🚀 **Local Development (Without Docker)**

### Backend Setup
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup  
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 **Docker Development**

### Quick Start
```bash
# Ensure environment files exist
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start all services
docker-compose up --build
```

---

## 📍 **Production Deployment**

### 1. Production Server Setup
```bash
# Copy production environment templates
cp backend/.env.example backend/.env.production  
cp frontend/.env.example frontend/.env.production

# Update with production URLs and secrets
# backend/.env.production - database URLs, JWT secrets, API keys
# frontend/.env.production - production API URLs, NextAuth config
```
```bash
# If you only want to run databases on production
docker-compose -f docker-compose.services.yml up -d
```

---

## 💻 **Development Machine Setup**

### 1. Environment Configuration
```bash
# Copy development environment template
cp .env.dev .env

# Verify database connection URLs point to production
DATABASE_URL=postgresql://postgres:postgres123@10.8.0.3:5432/groupchatai
REDIS_URL=redis://10.8.0.3:6379
```

### 2. Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend (connects to remote DB)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Run frontend in development mode
npm run dev
```

### 4. Access Points
- **Development Frontend**: http://localhost:3000
- **Development Backend**: http://localhost:8000
- **Production Stack**: http://10.8.0.3:3000

---

## 🔧 **Network Configuration**

### Production Server (10.8.0.3) Firewall Rules:
```bash
# Allow PostgreSQL access from development machines
sudo ufw allow 5432/tcp

# Allow Redis access from development machines  
sudo ufw allow 6379/tcp

# Allow web access
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

### Development Machine Testing:
```bash
# Test PostgreSQL connection
telnet 10.8.0.3 5432

# Test Redis connection
redis-cli -h 10.8.0.3 -p 6379 ping

# Test API connection
curl http://10.8.0.3:8000/docs
```

---

## 📋 **Environment Files Summary**

### `.env.production` (Production Server)
```bash
EXTERNAL_IP=10.8.0.3
NEXT_PUBLIC_API_URL=http://10.8.0.3:8000
NEXTAUTH_URL=http://10.8.0.3:3000
INTERNAL_API_URL=http://backend:8000
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/groupchatai
REDIS_URL=redis://redis:6379
```

### `.env.dev` (Development Machine)
```bash
DATABASE_URL=postgresql://postgres:postgres123@10.8.0.3:5432/groupchatai
REDIS_URL=redis://10.8.0.3:6379
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
INTERNAL_API_URL=http://localhost:8000
```

---

## 🔄 **Deployment Scenarios**

### Scenario A: Full Stack on Production + Local Development
```bash
# Production (10.8.0.3)
docker-compose -f docker-compose.prod.yml up -d

# Development (Local)
cp .env.dev .env
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

### Scenario B: Only Databases on Production + Local Development
```bash
# Production (10.8.0.3) - Only databases
docker-compose -f docker-compose.services.yml up -d

# Development (Local) - Backend + Frontend
cp .env.dev .env
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

### Scenario C: Local Development with Local Databases
```bash
# Local - Everything local
cp .env .env.local  # Use localhost URLs
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🐛 **Troubleshooting**

### Connection Issues:
```bash
# Check if remote database is accessible
nc -zv 10.8.0.3 5432  # PostgreSQL
nc -zv 10.8.0.3 6379  # Redis

# Check Docker container logs
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs redis
```

### Database Migration:
```bash
# Run migrations on remote database
cd backend
alembic upgrade head
```

### Reset Remote Database:
```bash
# On production server
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```