# Life OS Authentication API Documentation

## Base URL
```
http://localhost:8000/api/auth/
```

## Endpoints

### 1. Register New User
**POST** `/register/`

Request body:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "display_name": "John Doe"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

### 2. Login User
**POST** `/login/`

Request body:
```json
{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful.",
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "",
    "last_name": "",
    "date_joined": "2024-01-01T00:00:00Z",
    "profile": {
      "email": "user@example.com",
      "username_field": "username",
      "display_name": "John Doe",
      "avatar_url": "",
      "timezone": "UTC",
      "theme": "light",
      "onboarding_complete": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### 3. Logout User
**POST** `/logout/`

Headers:
```
Authorization: Bearer {access_token}
```

Request body:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Logout successful."
}
```

---

### 4. Get Current User Profile
**GET** `/me/`

Headers:
```
Authorization: Bearer {access_token}
```

Response (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "first_name": "",
    "last_name": "",
    "date_joined": "2024-01-01T00:00:00Z",
    "profile": {
      "email": "user@example.com",
      "username_field": "username",
      "display_name": "John Doe",
      "avatar_url": "",
      "timezone": "UTC",
      "theme": "light",
      "onboarding_complete": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### 5. Change Password
**POST** `/change-password/`

Headers:
```
Authorization: Bearer {access_token}
```

Request body:
```json
{
  "old_password": "CurrentPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

Error Response (400 Bad Request):
```json
{
  "success": false,
  "errors": {
    "old_password": ["Old password is incorrect."],
    "confirm_password": ["Passwords do not match."]
  }
}
```

---

### 6. Forgot Password
**POST** `/forgot-password/`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "If account exists, password reset link has been sent."
}
```

---

### 7. Reset Password
**POST** `/reset-password/`

Request body:
```json
{
  "uid": "MQ==",
  "token": "abc123def456",
  "password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful."
}
```

Error Response (400 Bad Request):
```json
{
  "success": false,
  "errors": {
    "token": ["Invalid or expired token."],
    "confirm_password": ["Passwords do not match."]
  }
}
```

---

### 8. Refresh Access Token
**POST** `/token/refresh/`

Request body:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer {access_token}
```

The access token is valid for **15 minutes**.
The refresh token is valid for **14 days**.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "errors": {
    "email": ["Email already exists."],
    "password": ["Password must contain at least 8 characters."]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "errors": {
    "detail": "An error occurred while processing your request."
  }
}
```

---

## Password Requirements

- **Minimum length**: 8 characters
- **Must contain**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (!@#$%^&*)

---

## Token Structure

### Access Token Payload
```json
{
  "token_type": "access",
  "exp": 1640000000,
  "iat": 1639999000,
  "jti": "abc123def456",
  "user_id": 1
}
```

### Refresh Token Payload
```json
{
  "token_type": "refresh",
  "exp": 1640500000,
  "iat": 1639999000,
  "jti": "xyz789uvw012",
  "user_id": 1
}
```

---

## Security Features

✅ **JWT Authentication** - Stateless, secure token-based authentication
✅ **Token Rotation** - Refresh tokens rotate on each refresh
✅ **Token Blacklisting** - Tokens are blacklisted on logout
✅ **Password Hashing** - Uses Django's PBKDF2 hashing
✅ **CORS Protection** - Cross-origin requests validated
✅ **Rate Limiting** - Coming soon
✅ **Email Verification** - Coming soon

---

## Frontend Integration

### Storing Tokens
```javascript
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user@example.com', password: 'password' })
});

const data = await response.json();
localStorage.setItem('lifeos_access', data.tokens.access);
localStorage.setItem('lifeos_refresh', data.tokens.refresh);
```

### Using Tokens
```javascript
const response = await fetch('http://localhost:8000/api/auth/me/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('lifeos_access')}`,
    'Content-Type': 'application/json'
  }
});
```

### Refreshing Tokens
```javascript
const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh: localStorage.getItem('lifeos_refresh') })
});

const data = await response.json();
localStorage.setItem('lifeos_access', data.access);
```

---

## Environment Variables

Set in `.env`:
```
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

DATABASE_URL=postgresql://user:password@localhost:5432/lifeos
REDIS_URL=redis://localhost:6379/0

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@lifeos.app

FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "SecurePassword123!",
    "display_name": "John Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer {access_token}"
```

---

## Common Issues

### "Invalid email or password"
- Verify email is lowercase
- Check password is correct
- Ensure user account exists

### "Token has been revoked"
- User is logged out
- Need to login again to get new tokens

### "Token is invalid or expired"
- Access token expired (> 15 minutes)
- Use refresh endpoint to get new access token

### "Email already exists"
- Choose different email
- Or login with existing account

---

## Support

For API support, contact: support@lifeos.app
