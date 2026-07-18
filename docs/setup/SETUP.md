# Life OS - Complete Setup Guide

This guide will help you set up the Life OS application from scratch.

## Prerequisites

- Python 3.10+ 
- Node.js 18+
- PostgreSQL 16+ (or use Docker)
- Redis (or use Docker)
- Git

## Quick Start with Docker

The easiest way to get started is using Docker for the database and Redis:

### 1. Start Database & Redis

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### 2. Backend Setup

```bash
# Navigate to backend
cd backend/life_os

# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create .env file
```

Create `backend/life_os/.env` with:
```env
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://lifeos:lifeos123wqdfTy@localhost:5432/lifeos
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=Life OS <noreply@lifeos.app>
```

```bash
# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local file
```

Create `frontend/.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Manual Setup (Without Docker)

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and note the password you set

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Create database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE lifeos;
CREATE USER lifeos WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE lifeos TO lifeos;
\q
```

### 2. Install Redis

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use WSL2

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 3. Continue with Backend & Frontend Setup

Follow steps 2 and 3 from the Docker section above, adjusting the DATABASE_URL in your .env file to match your PostgreSQL credentials.

## Verify Installation

### 1. Check Backend API

Visit: http://localhost:8000/api/

You should see the API root with available endpoints.

### 2. Check Django Admin

Visit: http://localhost:8000/admin/

Login with the superuser credentials you created.

### 3. Check Frontend

Visit: http://localhost:3000

You should see the Life OS landing page.

## Creating Your First Account

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. Login at http://localhost:3000/login
4. You'll be redirected to the dashboard

## Using the Trackers

### Mood Tracker
Navigate to: http://localhost:3000/dashboard/mood

Features:
- Pick a mood emoji (Radiant 🤩, Steady 🙂, Neutral 😐, Low 😔, Heavy 😣)
- Set intensity (1-10)
- Add daily notes
- View interactive calendar
- See weekly/monthly trends
- Track mood streaks

### Sleep Tracker
Navigate to: http://localhost:3000/dashboard/sleep

Features:
- Log sleep duration
- Record bedtime and wake time
- Rate sleep quality (1-10)
- Add notes about sleep factors
- View calendar and trends
- Track sleep schedule consistency

### Focus Tracker
Navigate to: http://localhost:3000/dashboard/focus

Features:
- Start Pomodoro timer (25 min)
- Choose session type (Pomodoro, Deep Work, Study, Review)
- Track subjects
- Rate productivity (1-10)
- View focus calendar
- See productivity graphs
- Track focus streaks

## Troubleshooting

### Backend Issues

**Migration errors:**
```bash
# Delete migrations and database
python manage.py flush
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete

# Recreate migrations
python manage.py makemigrations
python manage.py migrate
```

**Port already in use:**
```bash
# Run on different port
python manage.py runserver 8001
```

### Frontend Issues

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
# Run on different port
npm run dev -- -p 3001
```

### Database Issues

**Connection refused:**
- Ensure PostgreSQL is running: `pg_ctl status`
- Check DATABASE_URL in .env matches your setup

**Authentication failed:**
- Verify username and password in DATABASE_URL
- Check pg_hba.conf for authentication method

### CORS Issues

If you see CORS errors in the browser console:
1. Check FRONTEND_URL in backend .env
2. Ensure it matches your frontend URL exactly
3. Restart the backend server

## Development Tips

### Backend Tips

**Create new migrations after model changes:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Access Django shell:**
```bash
python manage.py shell
```

**Run tests:**
```bash
python manage.py test
```

**Create sample data:**
```python
# In Django shell
from apps.trackers.models import MoodEntry
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()

MoodEntry.objects.create(
    user=user,
    mood='great',
    emoji='🤩',
    label='Radiant',
    score=9,
    note='Had a productive day!',
    logged_on='2024-01-15'
)
```

### Frontend Tips

**Clear Next.js cache:**
```bash
rm -rf .next
npm run dev
```

**Type checking:**
```bash
npx tsc --noEmit
```

**Linting:**
```bash
npm run lint
```

## Production Deployment

For production deployment, additional steps are needed:

1. Set `DJANGO_DEBUG=False`
2. Use a strong SECRET_KEY
3. Configure proper ALLOWED_HOSTS
4. Set up static files serving
5. Use environment-specific .env files
6. Enable HTTPS
7. Set up proper CORS origins
8. Configure email for password reset
9. Set up monitoring and logging
10. Regular database backups

## API Documentation

Once running, the API root is available at:
http://localhost:8000/api/

Key endpoints:

**Authentication:**
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/token/` - Get JWT tokens
- POST `/api/auth/token/refresh/` - Refresh access token
- POST `/api/auth/password-reset/` - Request password reset
- POST `/api/auth/password-reset-confirm/` - Confirm reset

**Mood Tracker:**
- GET/POST `/api/mood/` - List/create entries
- GET/PATCH/DELETE `/api/mood/{id}/` - Detail operations
- GET `/api/mood/stats/` - Statistics
- GET `/api/mood/trends/?period=weekly|monthly` - Trends
- GET `/api/mood/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar

**Sleep Tracker:**
- GET/POST `/api/sleep/` - List/create entries
- GET/PATCH/DELETE `/api/sleep/{id}/` - Detail operations
- GET `/api/sleep/stats/` - Statistics
- GET `/api/sleep/trends/?period=weekly|monthly` - Trends
- GET `/api/sleep/report/?period=weekly|monthly` - Report
- GET `/api/sleep/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar

**Focus Tracker:**
- GET/POST `/api/focus/` - List/create sessions
- GET/PATCH/DELETE `/api/focus/{id}/` - Detail operations
- POST `/api/focus/{id}/complete/` - Complete session
- GET `/api/focus/stats/` - Statistics
- GET `/api/focus/trends/?period=weekly|monthly` - Trends
- GET `/api/focus/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar

## Support

For issues or questions:
1. Check this SETUP.md guide
2. Review the README.md
3. Check Django and Next.js documentation
4. Review error messages carefully

## Next Steps

After setup:
1. Customize the theme colors in Tailwind config
2. Add more mood options if needed
3. Customize session types for focus tracker
4. Set up proper email for password reset
5. Add additional features from the roadmap
6. Configure production environment

Happy tracking! 🎯
