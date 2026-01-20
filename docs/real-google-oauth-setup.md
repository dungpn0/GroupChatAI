# Hướng dẫn Setup Google OAuth cho GroupChatAI

## 1. Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đảm bảo billing đã được kích hoạt (nếu cần thiết)

## 2. Kích hoạt Google+ API và Google Identity Services

1. Trong Google Cloud Console, đi đến **APIs & Services > Library**
2. Tìm và kích hoạt:
   - **Google+ API** (cho legacy support)
   - **Google Identity and Access Management (IAM) API**
   - **Google People API** (để lấy thông tin profile)

## 3. Tạo OAuth 2.0 Credentials

1. Đi đến **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client IDs**
3. Chọn **Web application**
4. Đặt tên cho OAuth client (ví dụ: "GroupChatAI Web Client")

### Cấu hình Authorized origins:
```
http://localhost:3000
http://127.0.0.1:3000
https://yourdomain.com (production domain)
```

### Cấu hình Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google  
https://yourdomain.com/api/auth/callback/google (production domain)
```

5. Click **Create**
6. Copy **Client ID** và **Client Secret**

## 4. Cập nhật Environment Variables

### Frontend (.env.local):
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Backend (.env):
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 5. Cài đặt Dependencies

### Backend:
```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

### Frontend:
```bash
cd frontend
npm install google-auth-library @google-cloud/local-auth
```

## 6. Test Google OAuth

1. Start backend server:
```bash
cd backend
python -m app.main
```

2. Start frontend server:
```bash
cd frontend
npm run dev
```

3. Truy cập http://localhost:3000/auth/login
4. Click "Sign in with Google"
5. Hoàn thành Google OAuth flow

## 7. Troubleshooting

### Lỗi thường gặp:

1. **"redirect_uri_mismatch"**
   - Kiểm tra lại Authorized redirect URIs trong Google Cloud Console
   - Đảm bảo URL chính xác và có http/https đúng

2. **"invalid_client"**
   - Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
   - Đảm bảo credentials được copy chính xác

3. **"access_blocked"**
   - Kiểm tra OAuth consent screen đã được cấu hình
   - Thêm email test users nếu app đang ở test mode

4. **"popup_closed_by_user"**
   - User đã đóng popup trước khi hoàn thành OAuth flow
   - Người dùng cần thử lại

### Check Google OAuth Setup:
1. Đi đến **APIs & Services > OAuth consent screen**
2. Cấu hình thông tin app:
   - App name: "GroupChatAI"
   - User support email
   - App logo (optional)
   - Developer contact information

3. Thêm scopes cần thiết:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

4. Thêm test users nếu app đang ở development mode

## 8. Production Deployment

Khi deploy lên production:

1. Cập nhật Authorized origins và redirect URIs với production domain
2. Update environment variables với production values
3. Đảm bảo HTTPS được kích hoạt cho production domain
4. Publish OAuth consent screen (nếu muốn công khai)

## 9. Security Best Practices

1. **Không commit credentials vào git**
   - Sử dụng `.env` files và thêm vào `.gitignore`

2. **Rotate credentials định kỳ**
   - Thay đổi Client Secret theo lịch

3. **Giới hạn scopes**
   - Chỉ yêu cầu permissions cần thiết

4. **Monitor usage**
   - Theo dõi API quotas và usage trong Google Cloud Console

## 10. Next Steps

Sau khi Google OAuth hoạt động:

1. Implement logout với Google sign-out
2. Cấu hình refresh token handling
3. Add error handling cho expired tokens
4. Implement user profile sync từ Google