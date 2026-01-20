# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for GroupChatAI authentication.

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Admin access to your GroupChatAI project

## Step-by-Step Setup

### 1. 🌐 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** dropdown at the top
3. Click **"New Project"**
4. Enter project details:
   - **Project name**: `GroupChatAI` (or your preferred name)
   - **Location**: Your organization (if applicable)
5. Click **"Create"**

### 2. 🔧 Enable Google+ API

1. In your project dashboard, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on **"People API"**
4. Click **"Enable"**

### 3. 🛡️ Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** user type (for public access)
3. Click **"Create"**

#### Fill in OAuth Consent Screen:

**App Information:**
- **App name**: `GroupChatAI`
- **User support email**: Your email
- **App logo**: Upload your app logo (optional)

**App Domain:**
- **Application home page**: `http://localhost:3000` (for development)
- **Application privacy policy link**: `http://localhost:3000/privacy` (optional)
- **Application terms of service link**: `http://localhost:3000/terms` (optional)

**Authorized domains:**
- Add: `localhost` (for development)
- Add your production domain when deploying

**Developer contact information:**
- Add your email address

4. Click **"Save and Continue"**
5. **Scopes**: Click "Save and Continue" (default scopes are sufficient)
6. **Test users**: Add test emails if needed, click "Save and Continue"

### 4. 🔑 Create OAuth Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"+ Create Credentials"** > **"OAuth client ID"**
3. Select **"Web application"**

#### Configure OAuth Client:

**Name:** `GroupChatAI Web Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
http://127.0.0.1:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

> **Note**: For production, add your actual domain:
> - `https://yourdomain.com`
> - `https://yourdomain.com/api/auth/callback/google`

5. Click **"Create"**

### 5. 📋 Copy Your Credentials

After creation, you'll see a modal with your credentials:

```
Client ID: 123456789-abcdefghijk.apps.googleusercontent.com
Client Secret: GOCSPX-1234567890abcdefghijk
```

⚠️ **Important**: Copy these values immediately and store them securely.

### 6. 🔧 Configure GroupChatAI

#### Update your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghijk

# Make sure NextAuth is configured
NEXTAUTH_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_URL=http://localhost:3000
```

#### For Docker deployment:

Update your `docker-compose.yml` environment variables or use the `.env` file.

### 7. ✅ Test OAuth Integration

1. Restart your application:
   ```bash
   # If running with Docker
   docker-compose down
   docker-compose up -d

   # If running locally
   npm run dev  # in frontend directory
   ```

2. Navigate to `http://localhost:3000/auth/login`
3. Click **"Sign in with Google"**
4. You should be redirected to Google's OAuth consent screen
5. Accept permissions and verify successful login

## 🔒 Security Best Practices

### For Development:
- ✅ Use `localhost` and `127.0.0.1` for authorized origins
- ✅ Keep credentials in `.env` file (not in git)
- ✅ Use test users for development

### For Production:
- ✅ Use HTTPS only (`https://yourdomain.com`)
- ✅ Set proper authorized domains
- ✅ Use environment variables for credentials
- ✅ Enable additional security features:
  - Rate limiting
  - Domain restrictions
  - Advanced protection

## 🔄 Updating for Production

When deploying to production:

### 1. Update OAuth Consent Screen:
- Change app domain to your production URL
- Add production privacy policy and terms links

### 2. Update OAuth Client:
- Add production authorized origins: `https://yourdomain.com`
- Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`

### 3. Update Environment Variables:
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 🔍 Troubleshooting

### Common Issues:

#### ❌ "redirect_uri_mismatch" error
**Solution**: Ensure redirect URI in Google Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

#### ❌ "Access blocked: Authorization Error"
**Solution**: 
- Verify OAuth consent screen is configured
- Add your email to test users
- Check authorized domains

#### ❌ "Invalid client ID"
**Solution**:
- Double-check `GOOGLE_CLIENT_ID` in `.env`
- Ensure no extra spaces or characters
- Verify client ID format: `xxx-yyy.apps.googleusercontent.com`

#### ❌ "Client Secret mismatch"
**Solution**:
- Verify `GOOGLE_CLIENT_SECRET` is correct
- Regenerate client secret if needed
- Check for hidden characters

### 📞 Getting Help:

1. **Check Google Cloud Console Logs**: APIs & Services > Credentials > Usage
2. **Verify Environment Variables**: Ensure all values are correctly set
3. **Test with Different Browser**: Clear cache and cookies
4. **Check Network**: Ensure no proxy/firewall blocking Google APIs

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

> **Need help?** Check our [troubleshooting section](#🔍-troubleshooting) or open an issue in the GitHub repository.