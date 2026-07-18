# Life OS

A modern, premium life management system with mood tracking, sleep monitoring, and focus/productivity tools.

## Features

### Phase 1 (Complete)
- ✅ User authentication (register, login, password reset)
- ✅ Dashboard with life score overview
- ✅ Habit tracking system
- ✅ Experience points and leveling system

### Phase 2 (Complete)
- ✅ **Mood Tracker**
  - Emoji mood picker with 5 mood states
  - Intensity rating (1-10)
  - Daily notes and mood history
  - Interactive calendar view
  - Weekly & monthly trend analytics
  - Mood distribution charts
  - Streak tracking
  - CRUD operations

- ✅ **Sleep Tracker**
  - Sleep duration logging
  - Bedtime & wake-up time tracking
  - Sleep quality rating (1-10)
  - Interactive calendar view
  - Weekly & monthly analytics
  - Sleep schedule timeline
  - Quality charts and trends
  - CRUD operations

- ✅ **Focus / Study Tracker**
  - Fully functional Pomodoro timer with circular progress
  - Multiple session types (Pomodoro, Deep Work, Study, Review)
  - Subject tracking
  - Productivity ratings (1-10)
  - Session history and statistics
  - Focus streaks and daily goals
  - Interactive calendar view
  - Productivity graphs and charts
  - CRUD operations

## Tech Stack

### Backend
- Django 4.2+
- Django REST Framework
- PostgreSQL
- Celery (for background tasks)
- Redis (caching & celery broker)
- JWT authentication

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Framer Motion (animations)
- Recharts (data visualization)
- Modern glassmorphism UI

## Setup

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend/life_os
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r ../requirements.txt
```

4. Create `.env` file with required variables:
```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@localhost:5432/lifeos
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:3000
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run development server:
```bash
npm run dev
```

5. Open http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/password-reset/` - Request password reset
- `POST /api/auth/password-reset-confirm/` - Confirm password reset

### Trackers
- `GET|POST /api/trackers/mood/` - List/create mood entries
- `GET|PATCH|DELETE /api/trackers/mood/{id}/` - Retrieve/update/delete mood entry
- `GET /api/trackers/mood/stats/` - Mood statistics
- `GET /api/trackers/mood/trends/?period=weekly|monthly` - Mood trends
- `GET /api/trackers/mood/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar data

- `GET|POST /api/trackers/sleep/` - List/create sleep entries
- `GET|PATCH|DELETE /api/trackers/sleep/{id}/` - Retrieve/update/delete sleep entry
- `GET /api/trackers/sleep/stats/` - Sleep statistics
- `GET /api/trackers/sleep/trends/?period=weekly|monthly` - Sleep trends
- `GET /api/trackers/sleep/report/?period=weekly|monthly` - Sleep report
- `GET /api/trackers/sleep/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar data

- `GET|POST /api/trackers/focus/` - List/create focus sessions
- `GET|PATCH|DELETE /api/trackers/focus/{id}/` - Retrieve/update/delete session
- `POST /api/trackers/focus/{id}/complete/` - Complete active session
- `GET /api/trackers/focus/stats/` - Focus statistics
- `GET /api/trackers/focus/trends/?period=weekly|monthly` - Focus trends
- `GET /api/trackers/focus/calendar/?start=YYYY-MM-DD&end=YYYY-MM-DD` - Calendar data

## UI Design Philosophy

The application follows a modern, premium design inspired by:
- **Apple**: Clean, minimalist interfaces with attention to detail
- **Linear**: Beautiful gradients and smooth transitions
- **Notion**: Functional elegance and intuitive interactions
- **Vercel**: Modern glassmorphism and depth

### Design Features
- Light theme with glassmorphism effects
- Smooth animations using Framer Motion
- Interactive hover effects and micro-interactions
- Beautiful data visualizations with Recharts
- Responsive design for all screen sizes
- Loading states, empty states, and error handling
- Premium shadows, borders, and typography

## Project Structure

```
Life Manager/
├── backend/
│   └── life_os/
│       ├── apps/
│       │   ├── accounts/       # Authentication
│       │   ├── dashboard/      # Dashboard views
│       │   └── trackers/       # All tracker models & APIs
│       └── life_os/            # Django settings
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── mood/          # Mood tracker page
│   │   │   ├── sleep/         # Sleep tracker page
│   │   │   └── focus/         # Focus tracker page
│   │   ├── login/             # Login page
│   │   └── register/          # Registration page
│   ├── components/            # React components
│   └── lib/                   # API client & utilities
└── docker-compose.yml         # Docker configuration

```

## Database Models

### MoodEntry
- `mood`: Choice field (great, good, okay, low, bad)
- `emoji`: Emoji representation
- `label`: Custom label
- `score`: Intensity rating (1-10)
- `note`: Daily notes
- `logged_on`: Date of entry

### SleepEntry
- `slept_on`: Date of sleep
- `duration_minutes`: Total sleep duration
- `quality`: Sleep quality rating (1-10)
- `bedtime`: Time went to bed
- `wake_time`: Time woke up
- `note`: Notes about sleep

### FocusSession
- `subject`: Study/work subject
- `session_type`: Type (pomodoro, deep_work, study, review)
- `started_at`: Session start time
- `ended_at`: Session end time
- `duration_minutes`: Planned/actual duration
- `completed`: Whether session was completed
- `productivity_rating`: Self-assessed productivity (1-10)
- `notes`: Session notes

## Contributing

This is a personal project. Feel free to fork and customize for your own use.

## License

MIT License - feel free to use this project as inspiration or starting point for your own life management system.
