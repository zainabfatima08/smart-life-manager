# Life OS Backend - Django REST Framework

## Overview

Life OS is a comprehensive personal life management system built with Django and Django REST Framework. It helps users track habits, mood, focus, finances, goals, reading, and journal entries in one unified dashboard.

## Tech Stack

- **Framework**: Django 5+
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (Simple JWT)
- **Cache/Queue**: Redis
- **Task Queue**: Celery
- **Email**: SMTP (Gmail, SendGrid, etc.)
- **Social Auth**: Google OAuth 2.0, GitHub OAuth
- **Documentation**: OpenAPI/Swagger (Coming Soon)

## Project Structure

```
backend/
├── life_os/                      # Main Django project
│   ├── settings.py               # Django settings
│   ├── urls.py                   # Main URL configuration
│   ├── wsgi.py                   # WSGI application
│   ├── asgi.py                   # ASGI application
│   └── celery.py                 # Celery configuration
│
├── apps/
│   ├── accounts/                 # User authentication & profiles
│   │   ├── models.py             # User, Profile, Achievement, etc.
│   │   ├── views.py              # Profile views
│   │   ├── auth_views.py         # Authentication endpoints
│   │   ├── serializers.py        # DRF serializers
│   │   ├── urls.py               # App URL routing
│   │   ├── authentication.py     # JWT authentication
│   │   ├── email_utils.py        # Email sending utilities
│   │   └── migrations/           # Database migrations
│   │
│   ├── trackers/                 # Core tracking features
│   │   ├── models.py             # Habits, Mood, Goals, etc.
│   │   ├── views.py              # Tracker endpoints
│   │   ├── serializers.py        # DRF serializers
│   │   ├── services.py           # Business logic
│   │   ├── selectors.py          # Query helpers
│   │   └── migrations/
│   │
│   └── dashboard/                # Dashboard & analytics
│       ├── models.py
│       ├── views.py
│       ├── services.py
│       └── migrations/
│
├── manage.py                     # Django management script
├── requirements.txt              # Python dependencies
└── .env                          # Environment variables

```

## Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- Redis 6+
- pip or uv

### Setup Steps

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
cp .env.example .env
```

5. **Configure environment variables**
```
DJANGO_SECRET_KEY=your-secret-key-here
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

6. **Run migrations**
```bash
python manage.py migrate
```

7. **Create superuser**
```bash
python manage.py createsuperuser
```

8. **Start development server**
```bash
python manage.py runserver 8000
```

The API will be available at `http://localhost:8000/api/`

---

## Authentication Endpoints

### Register
```
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123!",
  "display_name": "John Doe"
}
```

### Login
```
POST /api/auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Get Current User
```
GET /api/auth/me/
Authorization: Bearer {access_token}
```

### Change Password
```
POST /api/auth/change-password/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "old_password": "CurrentPassword123!",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

### Forgot Password
```
POST /api/auth/forgot-password/
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/auth/reset-password/
Content-Type: application/json

{
  "uid": "MQ==",
  "token": "abc-123-def",
  "password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

### Logout
```
POST /api/auth/logout/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh": "{refresh_token}"
}
```

---

## JWT Token Management

### Access Token
- Validity: 15 minutes
- Used for API requests
- Included in Authorization header: `Bearer {access_token}`

### Refresh Token
- Validity: 14 days
- Used to obtain new access tokens
- Rotates on each refresh (new token issued)

### Getting New Access Token
```
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "{refresh_token}"
}
```

Response:
```json
{
  "access": "new_access_token"
}
```

---

## Core Models

### User
- `id`: Primary key
- `email`: Unique email address
- `username`: Unique username
- `password`: Hashed password
- `first_name`: User's first name
- `last_name`: User's last name
- `date_joined`: Registration timestamp
- `last_login`: Last login timestamp
- `is_active`: Account status

### Profile
- `user`: OneToOne relation to User
- `display_name`: Public display name
- `avatar_url`: Profile picture URL
- `bio`: User biography
- `timezone`: User's timezone
- `theme`: Light/Dark/System theme
- `accent_color`: UI accent color
- `onboarding_complete`: Onboarding status
- Various preferences and settings

### Achievement
- `user`: ForeignKey to User
- `badge_name`: Achievement name
- `icon_name`: Icon identifier
- `achievement_type`: Type of achievement
- `is_unlocked`: Whether unlocked
- `unlocked_at`: When unlocked

### TokenBlacklist
- `token`: Blacklisted JWT token
- `user`: ForeignKey to User
- `blacklisted_at`: When blacklisted
- `expires_at`: Token expiration time

---

## Tracking Models (apps/trackers)

### Habit
- `user`: ForeignKey to User
- `title`: Habit name
- `description`: Habit description
- `category`: Type of habit
- `frequency`: Daily, weekly, etc.
- `streak_count`: Current streak
- `longest_streak`: Historical max streak
- `is_active`: Active status
- `created_at`: Creation timestamp

### MoodEntry
- `user`: ForeignKey to User
- `score`: Mood score (1-10)
- `emotion`: Primary emotion
- `notes`: Additional notes
- `logged_on`: Date logged
- `created_at`: Creation timestamp

### Goal
- `user`: ForeignKey to User
- `title`: Goal title
- `description`: Goal description
- `category`: Goal type
- `status`: active/completed/abandoned
- `target_date`: Deadline
- `created_at`: Creation timestamp

### ExpenseEntry
- `user`: ForeignKey to User
- `amount`: Transaction amount
- `category`: Expense/Income category
- `entry_type`: expense/income/transfer
- `description`: Transaction notes
- `occurred_on`: Transaction date
- `created_at`: Creation timestamp

### FocusSession
- `user`: ForeignKey to User
- `title`: Session title
- `duration_minutes`: Session length
- `completed`: Whether completed
- `started_at`: Start time
- `ended_at`: End time

---

## Business Logic

### Services (apps/trackers/services.py)

The service layer contains business logic and calculations:

- **Habit calculations**: Streaks, completion rates
- **Financial analytics**: Monthly/yearly summaries
- **Mood analytics**: Trends, averages
- **Goal progress**: Status, completion percentage

### Selectors (apps/trackers/selectors.py)

Query helpers for efficient data retrieval:

- Optimized database queries with prefetch_related
- Filtered querysets for user-specific data
- Aggregations and annotations

---

## Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password

3. Add to .env:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### SendGrid Setup

```
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Email Templates

Located in `apps/accounts/email_utils.py`:
- Password reset email
- Email verification
- Welcome email
- Notification digests

---

## Social Authentication

### Google OAuth

1. Create OAuth app in Google Cloud Console
2. Add to .env:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

3. Add redirect URI: `http://localhost:3000/callback/google`

### GitHub OAuth

1. Create OAuth app in GitHub Settings
2. Add to .env:
```
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

3. Add redirect URI: `http://localhost:3000/callback/github`

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Paginated Response
```json
{
  "count": 100,
  "next": "http://api.example.com/items/?page=2",
  "previous": null,
  "results": []
}
```

---

## Testing

### Unit Tests
```bash
python manage.py test apps.accounts
python manage.py test apps.trackers
```

### API Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "TestPassword123!",
    "display_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "TestPassword123!"
  }'
```

### API Testing with Postman

Import the collection from `backend/postman_collection.json`

---

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Generate strong `DJANGO_SECRET_KEY`
- [ ] Use PostgreSQL (not SQLite)
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Set up email backend
- [ ] Configure Redis for caching
- [ ] Run migrations
- [ ] Collect static files
- [ ] Set up monitoring/logging
- [ ] Configure backups
- [ ] Use production-grade server (Gunicorn)
- [ ] Use reverse proxy (Nginx)

### Deploy with Gunicorn
```bash
gunicorn life_os.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Deploy with Docker
```bash
docker build -t lifeos-backend .
docker run -p 8000:8000 lifeos-backend
```

---

## Troubleshooting

### Database Connection Error
```
django.db.utils.OperationalError: could not connect to server
```

**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct

### Email Sending Failed
```
SMTPAuthenticationError: (535, b'5.7.8 Username and password not accepted')
```

**Solution**: Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Add frontend URL to CORS_ALLOWED_ORIGINS in settings.py

### Token Invalid
```
'detail': 'Invalid token'
```

**Solution**: Refresh token or login again

---

## Development Tools

### Django Shell
```bash
python manage.py shell
```

### Database Shell
```bash
python manage.py dbshell
```

### Make Migrations
```bash
python manage.py makemigrations
```

### Run Migrations
```bash
python manage.py migrate
```

### Create Superuser
```bash
python manage.py createsuperuser
```

### Clear Cache
```bash
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

---

## Security Features

✅ **Password Security**
- Django's PBKDF2 password hashing
- Password strength validation
- Change password endpoint

✅ **Authentication**
- JWT token-based authentication
- Token rotation on refresh
- Token blacklisting on logout

✅ **Authorization**
- User-scoped data access
- Permission classes for endpoints
- Role-based access control (coming soon)

✅ **Network Security**
- HTTPS/SSL support
- CORS validation
- CSRF protection

✅ **Data Protection**
- Email verification
- Password reset via email
- Activity logging

---

## Performance Optimization

### Database Optimization
- Use `select_related()` for ForeignKey
- Use `prefetch_related()` for reverse ForeignKey
- Add database indexes
- Use pagination for large datasets

### Caching Strategy
- Cache user profiles
- Cache frequently accessed data
- Cache computed values
- Use Redis for session storage

### API Optimization
- Pagination (20 items per page)
- Field filtering
- Search indexing
- Gzip compression

---

## Monitoring & Logging

### Error Tracking (Coming Soon)
- Sentry integration
- Error notifications
- Performance monitoring

### Logging
- Request logging
- Error logging
- Activity logging
- Audit trail

---

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests
4. Submit a pull request

---

## License

Proprietary - Life OS Inc. 2024

---

## Support

For backend API issues:
- Email: backend@lifeos.app
- Documentation: /api/docs/
- GitHub Issues: github.com/lifeos/backend/issues

---

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT Documentation](https://django-rest-framework-simplejwt.readthedocs.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Last Updated**: January 2024
**Maintained By**: Life OS Backend Team
