# Environment Setup for GroupChatAI

## Quick Start (with defaults)

**Docker Compose sẽ chạy với giá trị mặc định ngay cả khi không có file .env!**

```bash
# Chạy ngay với default values
docker-compose up -d

# Backend sẽ có:
# - JWT_SECRET=your-default-jwt-secret-change-in-production
# - Các API keys để trống (cần cấu hình để dùng AI features)

# Frontend sẽ có:
# - NEXT_PUBLIC_APP_NAME=GroupChatAI
# - AI và Google auth enabled
# - Tất cả URLs đã configure cho Docker
```

## Production Setup (khuyến nghị)

1. **Setup Backend với API keys:**
   ```bash
   cp backend/.env.example backend/.env
   # Sửa backend/.env:
   # OPENAI_API_KEY=your-real-key
   # GOOGLE_GEMINI_API_KEY=your-real-key
   # JWT_SECRET=your-strong-secret
   ```

2. **Setup Frontend (optional - có defaults tốt):**
   ```bash
   cp frontend/.env.example frontend/.env.production
   # Sửa nếu cần customize
   ```

3. **Run:**
   ```bash
   docker-compose up -d
   ```

## Tại sao có Override trong Docker?

### Backend
- **DATABASE_URL**: Dev dùng `localhost:5432`, Docker dùng `postgres:5432` (container name)
- **REDIS_URL**: Dev dùng `localhost:6379`, Docker dùng `redis:6379`

### Frontend  
- **NEXT_PUBLIC_API_URL**: Browser cần gọi `localhost:8000`, nhưng build args có thể khác
- **INTERNAL_API_URL**: Server-side calls trong container dùng `backend:8000`

## Default Values

Docker compose có default values cho tất cả biến cần thiết:
- JWT secrets (cần đổi cho production)
- App name, feature flags
- URLs đã configure cho Docker networking

**Chỉ cần API keys là bắt buộc để sử dụng AI features!**