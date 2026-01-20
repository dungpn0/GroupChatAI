# Development Setup Guide

## Scenario: Separate Development and Production

### 📍 **Architecture:**
- **Production Server (10.8.0.3)**: PostgreSQL + Redis + Full Stack
- **Development Machine**: Only Backend + Frontend (connecting to remote DB)

---

## 🚀 **Production Server Setup (10.8.0.3)**

### 1. Full Stack Deployment
```bash
# Copy production environment
cp .env.production .env

# Update IP addresses in .env
EXTERNAL_IP=10.8.0.3
NEXT_PUBLIC_API_URL=http://10.8.0.3:8000
NEXTAUTH_URL=http://10.8.0.3:3000

# Deploy full stack with exposed database ports
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps
```

### 2. Only Database Services (Alternative)
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