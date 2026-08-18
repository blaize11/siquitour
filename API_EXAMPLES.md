# SiquiTour Authentication API - Request/Response Examples

Complete examples for testing all authentication endpoints with Postman, cURL, or REST Client.

---

## 🌐 API BASE URL

```
Local Development:  http://localhost:8000/api
Production:         https://yourdomain.com/api
```

All requests should include:
```
Content-Type: application/json
Accept: application/json
```

---

## 📝 NORMAL LOGIN

### Request

```http
POST /api/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Success Response (200)

```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "guest",
    "phone": "+63123456789",
    "avatar_url": null,
    "status": "active",
    "email_verified_at": "2026-08-18T10:30:00Z",
    "created_at": "2026-08-18T10:30:00Z",
    "updated_at": "2026-08-18T10:30:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|7edf5890b1c89c0e5e5a2e3b4c5d6e7f8g9h0i1j2k3l4m5n"
}
```

### Error Response (422)

```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "email": [
      "The provided credentials are incorrect."
    ]
  }
}
```

---

## 📝 REGISTRATION

### Request

```http
POST /api/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePassword123",
  "role": "guest",
  "phone": "+63987654321"
}
```

### Success Response (201)

```json
{
  "user": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "guest",
    "phone": "+63987654321",
    "avatar_url": null,
    "status": "active",
    "email_verified_at": null,
    "created_at": "2026-08-18T11:00:00Z",
    "updated_at": "2026-08-18T11:00:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|7edf5890b1c89c0e5e5a2e3b4c5d6e7f8g9h0i1j2k3l4m5n"
}
```

### Error Response (422)

```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

## 🔐 GOOGLE LOGIN

### Request

Mobile app sends this after Google OAuth authentication:

```http
POST /api/google-login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "google_id": "118364248738462547328",
  "email": "john@gmail.com",
  "name": "John Doe",
  "avatar": "https://lh3.googleusercontent.com/a/default-user=s96-c"
}
```

### Success Response (200)

New user:
```json
{
  "user": {
    "id": 3,
    "google_id": "118364248738462547328",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "guest",
    "phone": null,
    "avatar_url": "https://lh3.googleusercontent.com/a/default-user=s96-c",
    "status": "active",
    "email_verified_at": "2026-08-18T11:15:00Z",
    "created_at": "2026-08-18T11:15:00Z",
    "updated_at": "2026-08-18T11:15:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|9ghi1jkl2mno3pqr4stu5vwx6yz0abc1def2ghi3jkl4mno"
}
```

Existing user (same google_id):
```json
{
  "user": {
    "id": 3,
    "google_id": "118364248738462547328",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "guest",
    "phone": "+63912345678",
    "avatar_url": "https://lh3.googleusercontent.com/a/updated-photo=s96-c",
    "status": "active",
    "email_verified_at": "2026-08-18T11:15:00Z",
    "created_at": "2026-08-18T11:15:00Z",
    "updated_at": "2026-08-18T12:00:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|9ghi1jkl2mno3pqr4stu5vwx6yz0abc1def2ghi3jkl4mno"
}
```

Linking existing email account with Google:
```json
{
  "user": {
    "id": 1,
    "google_id": "118364248738462547328",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "tour_guide",
    "phone": "+63912345678",
    "avatar_url": "https://lh3.googleusercontent.com/a/default-user=s96-c",
    "status": "active",
    "email_verified_at": "2026-08-18T10:00:00Z",
    "created_at": "2026-08-18T10:00:00Z",
    "updated_at": "2026-08-18T12:05:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|9ghi1jkl2mno3pqr4stu5vwx6yz0abc1def2ghi3jkl4mno"
}
```

### Error Response (422)

```json
{
  "message": "The google id field is required.",
  "errors": {
    "google_id": [
      "The google id field is required."
    ]
  }
}
```

---

## 🔄 PASSWORD RESET FLOW

### Step 1: Request Password Reset Code

#### Request

```http
POST /api/forgot-password HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Success Response (200)

```json
{
  "message": "If an account exists for this email, a verification code has been sent."
}
```

**Note:** This message is the same whether the email exists or not (privacy protection).

#### What Happens Behind the Scenes

- ✅ If email exists: Generate 6-digit code, store in `password_reset_codes` table, send email
- ✅ If email doesn't exist: Still return success message (prevent account enumeration)
- ✅ Code expires in 10 minutes
- ✅ Previous codes for this email are invalidated

#### Email Sent to User

```
Subject: Your SiquiTour Password Reset Code

Hello User,

We received a request to reset your SiquiTour password.

Your verification code is:

483921

This code expires in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
SiquiTour Team
```

---

### Step 2: Verify Reset Code

#### Request

```http
POST /api/verify-reset-code HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "483921"
}
```

#### Success Response (200)

```json
{
  "message": "Code verified successfully."
}
```

#### Error Response (422)

Invalid code:
```json
{
  "message": "The verification code is incorrect or has expired.",
  "errors": {
    "code": [
      "The verification code is incorrect or has expired."
    ]
  }
}
```

Expired code (>10 minutes):
```json
{
  "message": "The verification code is incorrect or has expired.",
  "errors": {
    "code": [
      "The verification code is incorrect or has expired."
    ]
  }
}
```

Already used code:
```json
{
  "message": "The verification code is incorrect or has expired.",
  "errors": {
    "code": [
      "The verification code is incorrect or has expired."
    ]
  }
}
```

---

### Step 3: Reset Password

#### Request

```http
POST /api/reset-password HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "483921",
  "password": "NewSecurePassword123",
  "password_confirmation": "NewSecurePassword123"
}
```

#### Success Response (200)

```json
{
  "message": "Password reset successfully.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "guest",
    "phone": "+63123456789",
    "avatar_url": null,
    "status": "active",
    "email_verified_at": "2026-08-18T12:10:00Z",
    "created_at": "2026-08-18T10:30:00Z",
    "updated_at": "2026-08-18T12:10:00Z"
  },
  "token": "N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|9ghi1jkl2mno3pqr4stu5vwx6yz0abc1def2ghi3jkl4mno"
}
```

**Note:** User is automatically logged in with returned token.

#### Error Response (422)

Password too short:
```json
{
  "message": "The password field must be at least 8 characters.",
  "errors": {
    "password": [
      "The password field must be at least 8 characters."
    ]
  }
}
```

Password confirmation mismatch:
```json
{
  "message": "The password field confirmation does not match.",
  "errors": {
    "password": [
      "The password field confirmation does not match."
    ]
  }
}
```

Invalid or expired code:
```json
{
  "message": "Invalid or expired verification code.",
  "errors": {
    "code": [
      "Invalid or expired verification code."
    ]
  }
}
```

---

## 🔐 AUTHENTICATED ENDPOINTS

All endpoints below require the authentication token in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

Example:
```
Authorization: Bearer N|NzA0NzI1NDE2MDExNzQ2NTEwMDMxNzEwNzQxNzc0OQ|7edf5890b1c89c0e5e5a2e3b4c5d6e7f8g9h0i1j2k3l4m5n
```

### Get Current User

#### Request

```http
GET /api/me HTTP/1.1
Host: localhost:8000
Authorization: Bearer TOKEN_HERE
```

#### Response (200)

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "guest",
  "phone": "+63123456789",
  "avatar_url": null,
  "status": "active",
  "email_verified_at": "2026-08-18T10:30:00Z",
  "created_at": "2026-08-18T10:30:00Z",
  "updated_at": "2026-08-18T10:30:00Z"
}
```

### Logout

#### Request

```http
POST /api/logout HTTP/1.1
Host: localhost:8000
Authorization: Bearer TOKEN_HERE
```

#### Response (200)

```json
{
  "message": "Logged out."
}
```

---

## 🧪 TESTING WITH cURL

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Request Password Reset

```bash
curl -X POST http://localhost:8000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Verify Code

```bash
curl -X POST http://localhost:8000/api/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "483921"
  }'
```

### Reset Password

```bash
curl -X POST http://localhost:8000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "483921",
    "password": "NewPassword123",
    "password_confirmation": "NewPassword123"
  }'
```

### Get Current User (with auth)

```bash
curl -X GET http://localhost:8000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 TESTING WITH Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Click **Code Snippet** and select the cURL examples above
4. Or create requests manually following the examples

### Environment Variables

Set up a Postman environment with:

```
base_url: http://localhost:8000/api
email: test@example.com
password: TestPassword123
token: (set after login)
code: (set after requesting reset)
```

### Use Variables in Requests

```
{{base_url}}/login
Authorization: Bearer {{token}}
```

---

## 🧪 TESTING WITH REST Client (VS Code Extension)

Create a file `.http` or `.rest`:

```http
@baseUrl = http://localhost:8000/api
@token = YOUR_TOKEN_HERE

### Register
POST {{baseUrl}}/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123",
  "role": "guest"
}

### Login
POST {{baseUrl}}/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPassword123"
}

### Request Password Reset
POST {{baseUrl}}/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}

### Verify Reset Code
POST {{baseUrl}}/verify-reset-code
Content-Type: application/json

{
  "email": "test@example.com",
  "code": "123456"
}

### Reset Password
POST {{baseUrl}}/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "code": "123456",
  "password": "NewPassword123",
  "password_confirmation": "NewPassword123"
}

### Get Current User
GET {{baseUrl}}/me
Authorization: Bearer {{token}}

### Logout
POST {{baseUrl}}/logout
Authorization: Bearer {{token}}
```

---

## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request (login, verify code, get user) |
| 201 | Created | Resource created (register, new user via Google) |
| 204 | No Content | Success with no response body |
| 400 | Bad Request | Missing or malformed request body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User not authorized for this action |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error (wrong email, weak password, etc.) |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Internal server error |

---

## 🔒 Security Headers

The API should return:

```
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 📝 NOTES

- ✅ Passwords are never returned in API responses
- ✅ Reset codes are never returned in API responses
- ✅ Google secrets are never returned
- ✅ SMTP credentials are never returned
- ✅ Tokens are returned only after successful authentication
- ✅ All timestamps are in ISO 8601 format (UTC)
- ✅ All responses include consistent error formatting

---

**Version:** 1.0  
**Last Updated:** 2026-08-18
