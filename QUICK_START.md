# SiquiTour Authentication - Quick Start Guide

Fast setup guide for developers (5-15 minutes).

---

## ⚡ TLDR - What Was Implemented

✅ Email/password login and registration  
✅ Google OAuth login (creates account automatically)  
✅ Forgot password with 6-digit verification code  
✅ Password reset with email verification  
✅ 3 new React Native screens for password reset flow  
✅ Updated login screen with Google button  

---

## 📋 PRE-REQUISITES

- [ ] Laravel API running: `php artisan serve`
- [ ] Node modules installed: `npm install` in mobile app
- [ ] MySQL database configured
- [ ] Google Cloud credentials (for OAuth)
- [ ] Email provider configured (Gmail, SendGrid, etc.)

---

## 🚀 STEP-BY-STEP SETUP (15 minutes)

### 1. Backend Setup (5 minutes)

```bash
# Navigate to Laravel API
cd backend/laravel-api

# Install Socialite (optional, for future use)
composer require laravel/socialite

# Run database migrations
php artisan migrate

# Update .env file with your email and Google credentials
# See section below for .env values

# Clear cache
php artisan config:cache
php artisan cache:clear

# Start API
php artisan serve --host=0.0.0.0 --port=8000
```

**Verify it's running:** Visit http://localhost:8000 in browser

### 2. Frontend Setup (3 minutes)

```bash
# Navigate to mobile app
cd apps/mobile

# Copy .env.example to .env
cp .env.example .env

# Update .env with Google Client ID
# EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Start app (web for testing)
npm run web

# Or start with Expo
npx expo start
```

**Verify it's running:** Visit http://localhost:8081 in browser

### 3. Configure Environment Variables

#### Backend (.env)

```env
# Email (Gmail recommended for testing)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password
MAIL_FROM_ADDRESS="noreply@siquitour.com"

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/google-callback
```

#### Frontend (.env)

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 4. Get Google Credentials (5-10 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web type)
5. Add authorized redirect URI: `http://localhost:8000/api/google-callback`
6. Copy Client ID and Secret

---

## 🧪 QUICK TESTING

### Test Email/Password Login

```bash
# In Laravel Tinker
php artisan tinker

# Create test user
$user = User::factory()->create(['email' => 'test@example.com', 'password' => Hash::make('Test123')]);

# Copy user ID
```

Then in mobile app:
- Login with `test@example.com` and password `Test123`
- Should see home screen ✓

### Test Password Reset

1. Click "Forgot Password?" on login screen
2. Enter email → Verify code sent message appears
3. Check email for 6-digit code (check spam folder!)
4. Enter code → Enter new password → Success message → Redirect to home

### Test Google Login

1. Click "Continue with Google"
2. Complete Google sign-in in browser
3. Should redirect to home screen ✓

---

## 📁 FILES CREATED

### Backend
- `app/Models/PasswordResetCode.php` - Model for reset codes
- `app/Services/AuthService.php` - Authentication service
- `app/Mail/PasswordResetCodeMail.php` - Email template class
- `resources/views/emails/password-reset-code.blade.php` - Email HTML
- `database/migrations/2026_08_18_000001_*` - Add google_id
- `database/migrations/2026_08_18_000002_*` - Create password_reset_codes table

### Frontend
- `app/(auth)/forgot-password.tsx` - Request reset code screen
- `app/(auth)/verify-reset-code.tsx` - Verify code screen
- `app/(auth)/reset-password.tsx` - New password screen
- `apps/mobile/.env.example` - Environment template

---

## 📝 FILES MODIFIED

### Backend
- `routes/api.php` - Added password reset and Google OAuth routes
- `app/Http/Controllers/Auth/AuthController.php` - Added 4 new methods
- `app/Models/User.php` - Added google_id to fillable
- `config/services.php` - Added Google configuration
- `.env` - Added email and Google variables

### Frontend
- `src/auth/SessionContext.tsx` - Added Google and password reset methods
- `app/(auth)/index.tsx` - Added Google button and Forgot Password link
- `app.json` - Added expo-auth-session plugin

---

## ✅ VERIFICATION CHECKLIST

### Database
- [ ] Run `php artisan migrate`
- [ ] Check `users` table has `google_id` column
- [ ] Check `password_reset_codes` table exists

### Backend
- [ ] API starts without errors
- [ ] Can login with existing user
- [ ] Can register new user
- [ ] Email config works (test with `php artisan tinker`)

### Frontend
- [ ] App starts without errors
- [ ] Login screen displays
- [ ] "Forgot Password?" link visible
- [ ] "Continue with Google" button visible
- [ ] Can navigate to forgot password screens

### Integration
- [ ] Email/password login works end-to-end
- [ ] Can complete password reset flow
- [ ] Google OAuth button clickable
- [ ] Token stored after successful login

---

## 🆘 COMMON ISSUES

### "Code migrations not found"
```bash
# Ensure you're in the correct directory
cd backend/laravel-api
php artisan migrate
```

### "Email not received"
- Check spam folder
- Verify MAIL_* variables in .env
- Check Laravel logs: `storage/logs/laravel.log`
- Test manually: `php artisan tinker` → Use Mail facade

### "Google button not showing"
- Verify `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in .env
- Rebuild app: `expo prebuild --clean`
- Check browser console for errors

### "API connection failed (Android Emulator)"
- Verify using `10.0.2.2` (automatic in client.ts)
- Don't use `localhost` on Android Emulator
- Check that Laravel API is actually running

### "Token not persisting"
- Check SecureStore permissions
- Verify token is saved after login
- Test in web/Expo Go first (easier to debug)

---

## 📚 DETAILED DOCS

- **Setup Guide:** [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- **Implementation Details:** [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **API Examples:** [API_EXAMPLES.md](./API_EXAMPLES.md)

---

## 🎯 NEXT STEPS

1. ✅ **Clone/pull latest code**
2. ⏳ **Get Google credentials** (Google Cloud Console)
3. ⏳ **Configure .env files** (backend and frontend)
4. ⏳ **Run migrations** (`php artisan migrate`)
5. ⏳ **Start backend** (`php artisan serve`)
6. ⏳ **Start frontend** (`npm run web` or `npx expo start`)
7. ⏳ **Test all flows** (login, register, password reset, Google OAuth)
8. ⏳ **Deploy to production**

---

## 💡 TIPS

- **Start with web version** for faster testing and debugging
- **Use Expo DevTools** to debug React Native issues
- **Check Laravel logs** when API requests fail
- **Test with real Gmail account** for email verification
- **Use Postman** to test API endpoints directly
- **Save credentials securely** - use password manager for Google credentials

---

## 🔗 USEFUL LINKS

- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Expo Auth Session Docs](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Laravel Sanctum Docs](https://laravel.com/docs/sanctum)
- [Expo SecureStore Docs](https://docs.expo.dev/versions/latest/sdk/securestore/)

---

## ✨ YOU'RE ALL SET!

Everything is implemented and ready to test. Just:

1. Configure Google credentials
2. Configure email provider
3. Run migrations
4. Start servers
5. Test the flows

**Questions?** Check the detailed docs above or the code comments.

---

**Last Updated:** 2026-08-18  
**Status:** ✅ Ready for Testing
