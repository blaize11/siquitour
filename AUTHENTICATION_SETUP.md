# SiquiTour Authentication System - Setup Guide

Complete implementation guide for email/password + Google OAuth + Password Reset functionality.

---

## 📋 TABLE OF CONTENTS

1. [Backend Setup (Laravel)](#backend-setup)
2. [Frontend Setup (React Native)](#frontend-setup)
3. [Google OAuth Configuration](#google-oauth-configuration)
4. [Email Configuration](#email-configuration)
5. [Database Migrations](#database-migrations)
6. [Testing](#testing)
7. [Environment Variables](#environment-variables)
8. [Security Checklist](#security-checklist)

---

## BACKEND SETUP

### Step 1: Install Dependencies

```bash
cd backend/laravel-api
composer require laravel/socialite
```

**Note:** Socialite is installed but not used in the API-only implementation. If you want to use Socialite's OAuth URL generation in the future, it's available.

### Step 2: Run Migrations

Run the new migrations to add Google OAuth support and password reset codes:

```bash
php artisan migrate
```

This will:
- Add `google_id` column to `users` table
- Create `password_reset_codes` table

### Step 3: Verify Laravel Configuration

Verify that `config/services.php` has Google configuration:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

### Step 4: Set Environment Variables

Update `backend/laravel-api/.env`:

```env
# Email Configuration (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@siquitour.com"
MAIL_FROM_NAME="SiquiTour"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-callback
```

**For Production:**
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-callback
```

### Step 5: Clear Cache

```bash
php artisan config:cache
php artisan cache:clear
```

---

## FRONTEND SETUP

### Step 1: No Additional Packages Needed

The React Native app uses:
- `expo-auth-session` - Already available in Expo 57
- `expo-web-browser` - Already available
- Existing Secure Store for token storage

No additional `npm install` is needed for Google OAuth in the managed Expo environment.

### Step 2: Create .env File

Create `apps/mobile/.env` (copy from `.env.example`):

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:8000
```

For Android Emulator:
- API endpoint automatically uses `10.0.2.2:8000`
- This is handled automatically by the client.ts file

For iOS Simulator:
- Uses `localhost:8000`

For Web/Expo Go:
- Uses `localhost:8000`

### Step 3: Update app.json

Already done. The app.json includes:
- OAuth scheme: `siquitour://`
- expo-auth-session plugin with Google configuration

### Step 4: Rebuild Expo

For native platforms (iOS/Android), you need to rebuild:

```bash
# For development builds with EAS
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Or for local development with prebuild
expo prebuild --clean
```

For web and Expo Go:
```bash
cd apps/mobile
npm run web
# or
npx expo start
```

---

## GOOGLE OAUTH CONFIGURATION

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "SiquiTour Mobile"
3. Enable the **Google+ API** or **Google Identity Services API**

### Create OAuth 2.0 Credentials

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Choose: **Web application** (for backend) and **Android** / **iOS** (for mobile)

### Web Application (Backend OAuth Callback)

1. Application type: **Web application**
2. Authorized redirect URIs:
   ```
   http://localhost:8000/api/google-callback
   https://yourdomain.com/api/google-callback
   ```
3. Copy the Client ID and Client Secret
4. Add to `backend/laravel-api/.env`:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```

### Android (Mobile App)

1. Application type: **Android**
2. Package name: `com.siquitour` (or your package)
3. SHA-1 Certificate: Get from your keystore
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Copy the Client ID to `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
   ```

### iOS (Mobile App)

1. Application type: **iOS**
2. Bundle ID: `com.siquitour` (or your bundle)
3. Redirect URI schemes: Ensure `siquitour://` is configured
4. Copy the Client ID to `apps/mobile/.env`

### Expo-Specific Configuration

If using Expo with `expo-auth-session`:

1. In app.json, ensure the scheme matches:
   ```json
   "scheme": "siquitour"
   ```

2. Add Expo's client IDs to **Google Cloud Console**:
   ```
   https://auth.expo.io/@username/siquitour
   ```

3. Use the **EXPO_PUBLIC_GOOGLE_CLIENT_ID** (web client ID works for most Expo apps)

---

## EMAIL CONFIGURATION

### Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail"
4. Copy the 16-character password
5. Add to `.env`:
   ```env
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-16-char-app-password
   ```

### Alternative Email Providers

**SendGrid:**
```env
MAIL_MAILER=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
```

**Mailgun:**
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_SECRET=your-mailgun-key
```

**AWS SES:**
```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
```

### Test Email Sending

```bash
php artisan tinker
Mail::to('test@example.com')->send(new \App\Mail\PasswordResetCodeMail('John', '123456'));
```

---

## DATABASE MIGRATIONS

### Automatic (Recommended)

```bash
cd backend/laravel-api
php artisan migrate
```

### Manual Verification

Run these SQL commands to verify the changes:

```sql
-- Check users table for new columns
DESC users;
-- Should show: google_id (nullable, unique)

-- Check password_reset_codes table
DESC password_reset_codes;
-- Should have: id, email, code, expires_at, verified_at, created_at, updated_at
```

### Rollback (if needed)

```bash
php artisan migrate:rollback --step=2
```

This rolls back the last 2 migrations (Google OAuth and Password Reset Codes).

---

## API ENDPOINTS

### Authentication

#### Normal Login
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "N|..."
}
```

#### Google Login
```
POST /api/google-login
Content-Type: application/json

{
  "google_id": "118364248738...",
  "email": "user@gmail.com",
  "name": "John Doe",
  "avatar": "https://..."
}

Response:
{
  "user": { ... },
  "token": "N|..."
}
```

#### Register
```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "guest",
  "phone": "+63..."
}

Response:
{
  "user": { ... },
  "token": "N|..."
}
```

### Password Reset

#### Request Reset Code
```
POST /api/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "message": "If an account exists for this email, a verification code has been sent."
}
```

**Privacy Note:** Always returns the same message, regardless of whether email exists (prevents account enumeration).

#### Verify Reset Code
```
POST /api/verify-reset-code
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}

Response:
{
  "message": "Code verified successfully."
}

Error: { "message": "The verification code is incorrect or has expired." }
```

#### Reset Password
```
POST /api/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}

Response:
{
  "message": "Password reset successfully.",
  "user": { ... },
  "token": "N|..."
}
```

---

## TESTING

### Backend Testing

#### Test Password Reset Flow

```bash
cd backend/laravel-api
php artisan tinker

# Create a test user
$user = User::factory()->create(['email' => 'test@example.com']);

# Request reset code
$resetCode = \App\Services\AuthService::requestPasswordReset('test@example.com');
echo $resetCode->code; // e.g., "123456"

# Verify code
\App\Services\AuthService::verifyResetCode('test@example.com', '123456');

# Reset password
$user = \App\Services\AuthService::resetPassword('test@example.com', '123456', 'newpassword123');
echo $user->name; // Verified!
```

#### Test Google Login

```bash
php artisan tinker

# Simulate Google login
$result = \App\Services\AuthService::handleGoogleLogin(
  '118364248738...',
  'user@gmail.com',
  'John Doe',
  'https://...'
);

echo $result['created']; // true if new user, false if existing
echo $result['user']->email;
```

### Frontend Testing

#### Test Login Screen

1. Start mobile app:
   ```bash
   cd apps/mobile
   npm run web
   # or
   npx expo start
   ```

2. Test email/password login with existing user
3. Test "Forgot Password?" link
4. Test "Continue with Google" button

#### Test Password Reset Flow

1. Click "Forgot Password?"
2. Enter email → Should see "Code sent" message
3. Enter 6-digit code (check email)
4. Enter new password
5. Should redirect to home screen after success

#### Test Google OAuth

1. Click "Continue with Google"
2. Complete Google sign-in
3. Should create account automatically (default role: guest)
4. Should redirect to home screen

---

## ENVIRONMENT VARIABLES

### Backend (.env)

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=siquitour
DB_USERNAME=root
DB_PASSWORD=

# Email (Gmail)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@siquitour.com"
MAIL_FROM_NAME="SiquiTour"

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-callback
```

### Frontend (.env)

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### Production (.env)

Backend:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/google-callback
```

Frontend:
```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
EXPO_PUBLIC_API_URL=https://yourdomain.com
```

---

## SECURITY CHECKLIST

- ✅ Passwords are hashed using Laravel's default bcrypt hasher
- ✅ Google secrets are backend-only (never in frontend code)
- ✅ SMTP credentials are backend-only (never in frontend code)
- ✅ Reset codes are:
  - ✅ Randomly generated (6 digits)
  - ✅ Expire after 10 minutes
  - ✅ One-time use only
  - ✅ Not returned in API responses
  - ✅ Hashed before comparison (prevent timing attacks)
- ✅ Authentication tokens are:
  - ✅ Stored securely (SecureStore on iOS/Android, localStorage on web)
  - ✅ Sent via Bearer Authorization header
  - ✅ Validated on every protected request
- ✅ Email verification:
  - ✅ Google emails auto-verified
  - ✅ Marked as verified on password reset
- ✅ Account enumeration:
  - ✅ Forgot password returns same message for all emails
  - ✅ No public user list without authentication
- ✅ CORS configured for API endpoints
- ✅ Rate limiting can be added via middleware

---

## TROUBLESHOOTING

### Password Reset Code Not Received

1. Check `.env` email configuration
2. Check Laravel logs: `storage/logs/laravel.log`
3. Test manually:
   ```bash
   php artisan tinker
   Mail::to('test@example.com')->send(new \App\Mail\PasswordResetCodeMail('Test', '123456'));
   ```

### Google Login Not Working

1. Verify Client ID in app.json and .env match Google Cloud Console
2. Check redirect URI configuration in Google Cloud Console
3. Ensure `expo-auth-session` plugin is installed
4. Try rebuilding: `expo prebuild --clean`
5. Check browser logs in Expo DevTools

### Tokens Not Persisting

1. Verify `SecureStore` is working on device
2. Check that `setAuthToken()` is called after login
3. Verify token is saved to storage before navigation
4. Test in Expo Go first (easier debugging)

### Android Emulator Connection Issues

1. API URL should be `http://10.0.2.2:8000` (handled automatically by client.ts)
2. Verify Laravel API is running and accessible
3. Check Android emulator network settings
4. Try: `adb shell ping 10.0.2.2`

---

## NEXT STEPS

1. ✅ Backend setup (Laravel migrations, endpoints)
2. ✅ Frontend setup (SessionContext, screens)
3. ⏳ Configure Google OAuth credentials
4. ⏳ Configure email provider
5. ⏳ Test authentication flows
6. ⏳ Deploy to production

---

## SUPPORT

For issues or questions:
- Check Laravel logs: `backend/laravel-api/storage/logs/laravel.log`
- Check Expo logs in DevTools
- Review API responses in browser console (web) or React Native debugger

---

**Version:** 1.0  
**Last Updated:** 2026-08-18  
**Author:** SiquiTour Development Team
