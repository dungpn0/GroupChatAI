# GroupChatAI - Hướng Dẫn Sử Dụng

# GroupChatAI - Hướng Dẫn Sử Dụng Hoàn Chỉnh

## Mục Lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt và chạy ứng dụng](#cài-đặt-và-chạy-ứng-dụng)
3. [Hướng dẫn sử dụng chi tiết](#hướng-dẫn-sử-dụng-chi-tiết)
4. [Tính năng chính](#tính-năng-chính)
5. [Demo và Test](#demo-và-test)

## Giới thiệu

GroupChatAI là ứng dụng chat nhóm hiện đại với tích hợp AI, được xây dựng với:
- **Frontend**: NextJS 14, TypeScript, TailwindCSS
- **Backend**: Python FastAPI, SQLAlchemy
- **AI Integration**: OpenAI GPT, Google Gemini
- **Database**: PostgreSQL (production), SQLite (development)

### Tính năng chính:
✅ **Đăng nhập/Đăng ký**: Email/password và Google OAuth
✅ **Chat nhóm**: Giao diện chat chuyên nghiệp 
✅ **AI Chatbot**: Tích hợp AI với multiple models
✅ **Hệ thống Credit**: Pay-per-use cho AI responses
✅ **Responsive Design**: Tương thích mọi thiết bị
✅ **Real-time**: WebSocket cho chat realtime

## Cài đặt và chạy ứng dụng

### Yêu cầu hệ thống
- Node.js 18+ và npm
- Python 3.11+ và pip
- Git

### Bước 1: Chuẩn bị dự án
```bash
# Clone hoặc tải dự án về
cd groupchatai

# Copy environment file
cp .env.example .env
# Chỉnh sửa file .env nếu cần
```

### Bước 2: Setup Backend
```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install fastapi uvicorn pydantic

# Chạy server backend
python simple_main.py
```

✅ **Backend chạy tại**: http://localhost:8000
📋 **API Documentation**: http://localhost:8000/docs

### Bước 3: Setup Frontend
```bash
# Mở terminal mới
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server  
npm run dev
```

✅ **Frontend chạy tại**: http://localhost:3000

## Hướng dẫn sử dụng chi tiết

### 1. Đăng ký tài khoản mới
1. Truy cập http://localhost:3000 
2. Sẽ tự động redirect đến `/auth/login`
3. Nhấn **"Create a new account"**
4. Điền thông tin:
   - Email: example@gmail.com
   - Username: example_user
   - Full Name: Your Name
   - Password: 123456
5. Nhấn **"Create account"**
6. Tự động đăng nhập và chuyển đến trang chat

### 2. Đăng nhập với tài khoản demo
- Email: `admin@groupchatai.com`
- Password: `admin123`

### 3. Giao diện chính

#### 🔼 Navbar (Thanh trên cùng)
- **Logo "GroupChatAI"**: Bên trái  
- **Biểu tượng quà tặng** 🎁: Gift cards
- **Thông báo** 🔔: Badge hiển thị số thông báo (3)
- **User menu**: Avatar + dropdown menu với:
  - Thông tin user (email, credits)  
  - Buy Credits
  - Settings
  - Sign Out

#### ⬅️ Sidebar (Thanh bên trái)
- **Search box**: Tìm kiếm cuộc trò chuyện
- **"Create Group"** button: Tạo nhóm mới
- **Danh sách nhóm**:
  - General Discussion (3 unread)
  - Project Team (AI enabled)
  - Random (1 unread)
- **Credit info**: Hiển thị credits còn lại
- **"Buy More Credits"** button

#### 🖥️ Chat Window (Cửa sổ chat chính)
- **Group header**: Tên nhóm, số members, AI status
- **Message area**: Tất cả tin nhắn với:
  - User messages (bên phải, màu xanh)
  - Other users (bên trái, màu xám) 
  - AI messages (gradient purple-pink)
- **Input area**: 
  - Attach file button 📷
  - Message input với emoji button 😊
  - Send button ➤

### 4. Chat và tương tác với AI

#### Gửi tin nhắn
1. Chọn một nhóm từ sidebar (VD: "Project Team")
2. Nhập tin nhắn vào ô input
3. Nhấn Enter hoặc nút Send
4. Tin nhắn hiển thị ngay lập tức

#### Chat với AI
1. Chọn nhóm có AI enabled (hiển thị "AI: GPT-4")
2. Gửi tin nhắn bất kỳ, VD: "Hello AI, how are you?"
3. AI sẽ phản hồi sau 1-2 giây với:
   - Avatar gradient purple-pink
   - Model name (GPT-4) 
   - Response content
4. Credits sẽ bị trừ theo rate model

### 5. Quản lý Credits

#### Xem credits hiện tại
- **Sidebar**: Bottom section hiển thị số credits
- **Navbar dropdown**: User menu shows current credits
- **Tài khoản mới**: Tự động có 100.0 credits

#### Sử dụng credits  
- **Tự động**: Credits bị trừ khi AI respond
- **Rate**: 
  - GPT-4: 0.2 credits/response
  - GPT-3.5: 0.1 credits/response  
  - Gemini: 0.1 credits/response

## Tính năng chính

### ✅ Đã hoàn thành (Functional)
- ✅ **Authentication**: Register/Login với email/password
- ✅ **Chat Interface**: Professional UI với responsive design
- ✅ **Group Chat**: Multiple chat groups với real-time messaging
- ✅ **AI Integration**: Auto AI responses với typing indicator
- ✅ **Credit System**: Display và tracking credits
- ✅ **State Management**: Persistent login state với Zustand
- ✅ **API Integration**: REST API với FastAPI backend

### 🚧 Demo/Prototype (Working but simplified)
- 🚧 **Google OAuth**: Button available nhưng dùng mock token
- 🚧 **Group Creation**: Modal hiển thị "Coming soon"
- 🚧 **File Upload**: Button có nhưng chưa functional
- 🚧 **Credit Purchase**: Redirect đến placeholder page
- 🚧 **Real AI**: Hiện tại dùng mock responses

### 📋 Planned Features
- 📋 **Database Integration**: PostgreSQL với real data persistence
- 📋 **Real AI Models**: OpenAI và Google API integration
- 📋 **WebSocket**: Real-time messaging với Socket.IO
- 📋 **Group Management**: Create/join/invite members
- 📋 **Payment Integration**: Stripe/PayPal cho credit purchase
- 📋 **Mobile App**: React Native version

## Demo và Test

### Test Cases cơ bản

#### 1. Authentication Flow
```
✅ Register new user → Auto login → Redirect to chat
✅ Login existing user → Redirect to chat  
✅ Logout → Redirect to login
✅ Persistent login → Refresh page still logged in
```

#### 2. Chat Functionality  
```
✅ Select group → Load mock messages
✅ Send message → Display immediately  
✅ AI response → Shows typing indicator → AI message
✅ Multiple messages → Scroll to bottom
```

#### 3. UI/UX Testing
```
✅ Responsive design → Works on mobile/tablet
✅ Sidebar toggle → Hide/show sidebar
✅ Dark mode compatible → CSS variables ready
✅ Loading states → Spinner during auth
```

### Demo Data
- **Users**: admin@groupchatai.com / admin123
- **Groups**: 3 mock groups với different states
- **Messages**: Pre-loaded conversation history
- **Credits**: 100.0 default cho new users

### API Endpoints (Available)
```
GET  /                     → Health check
GET  /health              → System status  
POST /api/v1/auth/login   → User login
POST /api/v1/auth/register → User registration  
GET  /api/v1/auth/me      → Current user info
```

### Troubleshooting thường gặp

#### Backend Issues
```bash
# Error: Module not found
cd backend && python -m venv venv && venv\Scripts\activate

# Port already in use
# Tìm và kill process sử dụng port 8000
netstat -ano | findstr :8000
```

#### Frontend Issues  
```bash
# Dependencies error
rm -rf node_modules package-lock.json
npm install

# Build errors
npm run build
# Check console logs
```

#### Connection Issues
```bash
# CORS errors → Check backend CORS config
# API connection → Verify backend running on :8000
# State not persisting → Clear localStorage
```

**🎉 Chúc mừng! Bạn đã setup thành công GroupChatAI!**

Truy cập http://localhost:3000 để bắt đầu sử dụng ứng dụng.

---
*Phiên bản: 1.0.0 | Cập nhật: January 2026*
3. [Đăng ký và Đăng nhập](#đăng-ký-và-đăng-nhập)
4. [Quản lý Nhóm Chat](#quản-lý-nhóm-chat)
5. [Sử dụng AI Chatbot](#sử-dụng-ai-chatbot)
6. [Hệ thống Credit](#hệ-thống-credit)
7. [Các tính năng nâng cao](#các-tính-năng-nâng-cao)

## Giới thiệu

GroupChatAI là ứng dụng chat nhóm hiện đại tích hợp AI, cho phép người dùng:
- Tạo và quản lý các nhóm chat
- Tích hợp AI chatbot với nhiều mô hình LLM
- Hệ thống credit cho việc sử dụng AI
- Xác thực đa dạng (email/password, Google OAuth)

## Cài đặt và Khởi chạy

### Yêu cầu hệ thống
- Docker và Docker Compose
- Node.js 18+ (cho development)
- Python 3.11+ (cho development)

### Khởi chạy với Docker (Khuyên dùng)

1. **Clone dự án và cấu hình**
   ```bash
   git clone <repository-url>
   cd code
   cp .env.example .env
   ```

2. **Chỉnh sửa file .env**
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/groupchatai
   
   # API Keys (bắt buộc)
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Google OAuth (tùy chọn)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

3. **Khởi chạy ứng dụng**
   ```bash
   docker-compose up --build
   ```

4. **Truy cập ứng dụng**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Development Setup

1. **Backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**
   - Cài đặt PostgreSQL
   - Tạo database `groupchatai`
   - Cấu hình connection string trong `.env`

## Đăng ký và Đăng nhập

### Đăng ký tài khoản mới

1. **Truy cập trang đăng ký**
   - Mở http://localhost:3000
   - Click "Đăng ký" hoặc "Sign Up"

2. **Điền thông tin**
   - Email: Địa chỉ email hợp lệ
   - Username: Tên người dùng (duy nhất)
   - Mật khẩu: Tối thiểu 8 ký tự
   - Họ tên: Tùy chọn

3. **Xác nhận**
   - Hệ thống sẽ tự động đăng nhập sau khi đăng ký
   - Tài khoản mới được tặng 100 credits miễn phí

### Đăng nhập

#### Đăng nhập bằng Email/Password
1. Nhập email và mật khẩu
2. Click "Đăng nhập"

#### Đăng nhập bằng Google
1. Click "Đăng nhập với Google"
2. Chọn tài khoản Google
3. Cấp quyền cho ứng dụng

## Quản lý Nhóm Chat

### Tạo nhóm chat mới

1. **Truy cập Dashboard**
   - Sau khi đăng nhập, bạn sẽ thấy sidebar bên trái

2. **Tạo nhóm**
   - Click nút "Tạo Chat" hoặc "+"
   - Điền thông tin nhóm:
     - Tên nhóm
     - Mô tả (tùy chọn)
     - Loại nhóm: Công khai hoặc Riêng tư
     - Số thành viên tối đa

3. **Cấu hình AI (Chỉ Admin)**
   - Bật/tắt AI chatbot
   - Chọn mô hình AI:
     - **Gemini**: 0.1 credit/câu trả lời
     - **GPT-3.5**: 0.1 credit/câu trả lời  
     - **GPT-4**: 0.2 credit/câu trả lời

### Mời thành viên

#### Mời qua Link
1. Vào cài đặt nhóm
2. Click "Tạo link mời"
3. Chia sẻ link với người khác
4. Họ có thể join bằng cách click vào link

#### Mời qua Email
1. Vào cài đặt nhóm
2. Click "Mời thành viên"
3. Nhập email người muốn mời
4. Hệ thống sẽ gửi email mời tự động

### Quản lý thành viên

**Quyền Admin:**
- Thêm/xóa thành viên
- Cấp/thu hồi quyền admin
- Bật/tắt AI chatbot
- Thay đổi cài đặt nhóm
- Xóa tin nhắn

**Quyền thành viên thường:**
- Gửi tin nhắn
- Xem lịch sử chat
- Rời khỏi nhóm

## Sử dụng AI Chatbot

### Kích hoạt AI

1. **Chỉ Admin mới có thể:**
   - Vào cài đặt nhóm
   - Bật "Enable AI Chatbot"
   - Chọn mô hình AI phù hợp

2. **AI sẽ tự động phản hồi:**
   - Mỗi khi có tin nhắn mới trong nhóm
   - AI sẽ phân tích và trả lời thông minh
   - Hiển thị với avatar đặc biệt (gradient purple-pink)

### Mô hình AI có sẵn

#### Google Gemini (0.1 credit/response)
- Phù hợp: Chat thông thường, Q&A
- Ưu điểm: Giá rẻ, phản hồi nhanh
- Nhược điểm: Độ chính xác trung bình

#### OpenAI GPT-3.5 (0.1 credit/response)  
- Phù hợp: Chat đa dạng, giải thích
- Ưu điểm: Cân bằng giá/chất lượng
- Nhược điểm: Giới hạn context

#### OpenAI GPT-4 (0.2 credit/response)
- Phù hợp: Tác vụ phức tạp, sáng tạo
- Ưu điểm: Chất lượng cao nhất
- Nhược điểm: Giá cao nhất

### Tips sử dụng AI hiệu quả

1. **Câu hỏi rõ ràng:** Đặt câu hỏi cụ thể, rõ ràng
2. **Ngữ cảnh:** Cung cấp đủ thông tin ngữ cảnh
3. **Tiết kiệm credit:** Sử dụng Gemini cho câu hỏi đơn giản
4. **Sử dụng GPT-4:** Cho các tác vụ phức tạp, sáng tạo

## Hệ thống Credit

### Cách hoạt động

- **Credit ban đầu:** 100 credits khi đăng ký
- **Tiêu thụ:** Mỗi lần AI trả lời sẽ trừ credit
- **Kiểm tra số dư:** Hiển thị ở sidebar và navbar
- **Hết credit:** AI sẽ không phản hồi nữa

### Mua thêm Credit

1. **Truy cập trang mua credit:**
   - Click "Buy Credits" trong dropdown user
   - Hoặc click "Mua thêm credit" ở sidebar

2. **Chọn gói credit:**
   - Gói 100 credits: $5
   - Gói 500 credits: $20 (tiết kiệm 20%)
   - Gói 1000 credits: $35 (tiết kiệm 30%)

3. **Thanh toán:**
   - Hỗ trợ thẻ tín dụng
   - PayPal (sắp có)
   - Chuyển khoản ngân hàng (sắp có)

### Lịch sử giao dịch

- Xem trong "Settings" > "Credit History"
- Chi tiết từng giao dịch:
  - Thời gian
  - Loại (mua, sử dụng, bonus)
  - Số lượng credit
  - Mô hình AI sử dụng

## Các tính năng nâng cao

### Real-time Chat

- **WebSocket connection:** Tin nhắn real-time
- **Typing indicator:** Hiển thị khi ai đó đang gõ
- **Online status:** Xem ai đang online
- **Message status:** Đã gửi/đã nhận/đã xem

### Tìm kiếm

1. **Tìm kiếm tin nhắn:**
   - Dùng ô search ở đầu chat
   - Hỗ trợ tìm kiếm toàn văn
   - Filter theo người gửi, thời gian

2. **Tìm kiếm nhóm:**
   - Ô search ở sidebar
   - Tìm theo tên nhóm

### Notifications

- **Browser notifications:** Thông báo tin nhắn mới
- **Email notifications:** Khi được mention
- **Push notifications:** (Mobile app sắp có)

### Dark Mode

- Toggle trong Settings
- Tự động theo hệ thống
- Tiết kiệm pin cho mobile

### Export Chat

1. Vào cài đặt nhóm
2. Click "Export Chat History"  
3. Chọn format: JSON, TXT, PDF
4. Download file

## Troubleshooting

### Lỗi thường gặp

**Không kết nối được:**
- Kiểm tra internet
- Refresh trang (F5)
- Clear browser cache

**AI không phản hồi:**
- Kiểm tra credit còn lại
- Xem AI có được bật không
- Kiểm tra API key (admin)

**Không nhận được email mời:**
- Kiểm tra spam folder
- Xác nhận email chính xác
- Thử mời lại sau 5 phút

**Lỗi đăng nhập Google:**
- Kiểm tra popup blocker
- Thử incognito mode
- Clear cookies

### Liên hệ hỗ trợ

- Email: support@groupchatai.com
- Discord: [GroupChatAI Community](https://discord.gg/groupchatai)
- GitHub Issues: [Report Bug](https://github.com/groupchatai/issues)

## FAQ

**Q: Có thể thay đổi mô hình AI khi đã chọn không?**
A: Có, admin có thể thay đổi bất cứ lúc nào trong cài đặt nhóm.

**Q: Credit có hết hạn không?**  
A: Không, credit không có thời hạn sử dụng.

**Q: Có thể refund credit không?**
A: Có thể refund trong 7 ngày nếu chưa sử dụng.

**Q: Số lượng nhóm tối đa?**
A: Mỗi user có thể tạo tối đa 10 nhóm, tham gia tối đa 50 nhóm.

**Q: Kích thước file upload?**
A: Hiện tại chưa hỗ trợ upload file, sắp có trong update tiếp theo.

---

*Cập nhật lần cuối: Tháng 1, 2026*