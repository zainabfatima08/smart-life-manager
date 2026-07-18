# Premium Profile & Settings Backend Implementation - Life OS

## Implementation Complete ✅

This document outlines the complete backend implementation for the Premium Profile & Settings module.

---

## Database Schema Overview

### Models Created/Extended

#### 1. **Profile** (Extended)
- **Purpose**: Comprehensive user profile and settings management
- **Key Fields**:
  - Basic Info: `display_name`, `username`, `bio`, `avatar_url`, `banner_url`
  - Location: `country`, `timezone`, `preferred_language`
  - Appearance: `theme`, `accent_color`, `dashboard_layout`, `animations_enabled`, `font_size`
  - Companion: `selected_companion`, `show_companion`, `companion_speech_bubbles`, `companion_animation_speed`, `companion_sound_effects`
  - Notifications: Email, browser, habit, goal, reading, budget alerts
  - Reminder Times: `habit_reminder_time`, `goal_reminder_time`, `reading_reminder_time`
  - Privacy: `public_profile`, `show_achievements_public`, `show_stats_public`, `show_reading_public`
  - Accessibility: `reduced_motion`, `high_contrast`
  - Status: `profile_completion_percent`, `onboarding_complete`

#### 2. **Achievement**
- **Purpose**: Track user badges and achievements
- **Fields**:
  - `badge_name`: Name of the achievement
  - `description`: What was achieved
  - `icon_name`: Icon identifier
  - `achievement_type`: Type (habit, mood, sleep, focus, reading, expense, journal, goal)
  - `unlock_condition`: JSON storing unlock logic
  - `is_unlocked`: Boolean status
  - `unlocked_at`: Timestamp when unlocked
- **Constraints**: Unique combination of (user, badge_name)

#### 3. **Milestone**
- **Purpose**: Track user's life journey milestones
- **Fields**:
  - `title`: Milestone title
  - `description`: Milestone description
  - `milestone_type`: Type identifier (e.g., 'first_habit', 'streak_7', 'profile_created')
  - `icon_name`: Icon identifier
  - `achieved_at`: Timestamp (auto-set)
  - `metadata`: JSON for additional data
- **Ordering**: By achieved date (descending)

#### 4. **AccountActivity**
- **Purpose**: Track all user account activities for security and analytics
- **Fields**:
  - `activity_type`: Type (login, logout, password_change, email_change, device_login, profile_update, settings_change)
  - `description`: Activity description
  - `ip_address`: IP address of activity
  - `user_agent`: Browser/device info
  - `device_name`: Device identifier
  - `created_at`: Timestamp (auto-set)
- **Ordering**: By creation date (descending)

---

## API Endpoints

### Authentication Endpoints (Existing)
- `POST /api/register/` - Register new user
- `POST /api/forgot-password/` - Request password reset
- `POST /api/reset-password/` - Reset password with token
- `POST /api/google/` - Google OAuth login

### Profile Management Endpoints

#### 1. **GET/PUT /api/profile/detail/**
**Get and update detailed user profile with all settings**

**GET Response:**
```json
{
  "user_id": "123",
  "display_name": "John Doe",
  "username": "johndoe",
  "bio": "Life enthusiast",
  "avatar_url": "https://...",
  "banner_url": "https://...",
  "email": "john@example.com",
  "country": "US",
  "timezone": "America/New_York",
  "preferred_language": "en",
  "theme": "dark",
  "accent_color": "blue",
  "selected_companion": "astro",
  "profile_completion_percent": 75,
  ...all settings fields
}
```

**PUT Request:**
```json
{
  "display_name": "John Doe",
  "bio": "Updated bio",
  "theme": "dark",
  "accent_color": "purple",
  ...settings to update
}
```

#### 2. **GET /api/profile/statistics/**
**Get comprehensive user life statistics**

**Response:**
```json
{
  "habits": {
    "total": 12,
    "completed_today": 8,
    "completed_this_week": 55,
    "longest_streak": 45,
    "current_streak": 12
  },
  "reading": {
    "books_total": 24,
    "books_completed": 18,
    "pages_read_this_month": 450
  },
  "wellness": {
    "mood_score_week_avg": 7.2,
    "sleep_hours_week_avg": 7.1
  },
  "focus": {
    "sessions_this_month": 62,
    "sessions_completed": 58,
    "completion_rate": 93.5
  },
  "goals": {
    "active": 5,
    "completed": 12
  },
  "journal": {
    "entries": 156,
    "total_words": 45230
  },
  "finance": {
    "expenses_month": 1250.50,
    "income_month": 5000.00,
    "net_month": 3749.50
  }
}
```

#### 3. **GET /api/profile/achievements/**
**List all achievements for user**

**Response:**
```json
[
  {
    "id": 1,
    "badge_name": "Habit Master",
    "description": "Created 5 active habits",
    "icon_name": "🔥",
    "achievement_type": "habit",
    "is_unlocked": true,
    "unlocked_at": "2025-06-20T14:30:00Z"
  }
]
```

#### 4. **POST /api/profile/achievements/check/**
**Check and unlock new achievements**

**Response:**
```json
{
  "unlocked_count": 2,
  "new_achievements": [
    {
      "id": 2,
      "badge_name": "Reading Enthusiast",
      "description": "Completed 5 books",
      "icon_name": "📚",
      "is_unlocked": true,
      "unlocked_at": "2025-06-20T14:32:00Z"
    }
  ]
}
```

#### 5. **GET /api/profile/milestones/**
**Get user's milestone journey timeline**

**Response:**
```json
[
  {
    "id": 1,
    "title": "Your First Habit",
    "description": "Created your first habit",
    "milestone_type": "first_habit",
    "icon_name": "🔥",
    "achieved_at": "2025-01-15T10:00:00Z",
    "metadata": {"habit_count": 1}
  },
  {
    "id": 2,
    "title": "7 Day Streak",
    "description": "Maintained a 7 day habit streak",
    "milestone_type": "streak_7",
    "icon_name": "🔥",
    "achieved_at": "2025-02-20T18:45:00Z",
    "metadata": {"streak_days": 7}
  }
]
```

#### 6. **GET /api/profile/activity/**
**Get account activity history**

**Response:**
```json
[
  {
    "id": 1,
    "activity_type": "login",
    "description": "User logged in",
    "device_name": "Chrome on Windows",
    "ip_address": "192.168.1.1",
    "created_at": "2025-06-20T14:00:00Z"
  },
  {
    "id": 2,
    "activity_type": "profile_update",
    "description": "Profile updated",
    "device_name": "Safari on iPhone",
    "ip_address": "203.0.113.45",
    "created_at": "2025-06-20T13:30:00Z"
  }
]
```

### Settings Endpoints

#### 7. **GET /api/settings/**
**Get all user settings**

**Response:**
```json
{
  "theme": "dark",
  "accent_color": "blue",
  "selected_companion": "astro",
  "show_companion": true,
  "companion_speech_bubbles": true,
  "companion_animation_speed": 1,
  "companion_sound_effects": true,
  "email_notifications": true,
  "browser_notifications": true,
  "habit_reminders": true,
  "goal_reminders": true,
  "reading_reminders": true,
  "budget_alerts": true,
  "weekly_reports": true,
  "monthly_reports": true,
  "habit_reminder_time": "09:00",
  "goal_reminder_time": "18:00",
  "reading_reminder_time": "20:00",
  "dashboard_layout": "grid",
  "show_widgets": {"habits": true, "goals": true},
  "animations_enabled": true,
  "public_profile": false,
  "show_achievements_public": true,
  "show_stats_public": true,
  "show_reading_public": true,
  "font_size": "normal",
  "reduced_motion": false,
  "high_contrast": false
}
```

#### 8. **PUT /api/settings/**
**Update user settings**

**Request:**
```json
{
  "theme": "light",
  "accent_color": "purple",
  "email_notifications": false,
  "habit_reminder_time": "10:00"
}
```

**Response:**
```json
{
  "detail": "Settings updated successfully"
}
```

### Data Management Endpoints

#### 9. **POST /api/profile/export/**
**Export user data**

**Request:**
```json
{
  "format": "json"  // Options: json, csv, pdf
}
```

**Response:** (format-specific)
- **JSON**: Complete user data dump as JSON file
- **CSV**: Comma-separated values file
- **PDF**: Formatted PDF document

#### 10. **POST /api/profile/import/**
**Import previously exported data**

**Request:** (multipart/form-data)
```
file: <file.json>
```

**Response:**
```json
{
  "detail": "Data imported successfully"
}
```

### Public Profile Endpoint

#### 11. **GET /api/profile/public/{username}/**
**Get public profile view**

**Response:**
```json
{
  "display_name": "John Doe",
  "username": "johndoe",
  "bio": "Life enthusiast",
  "avatar_url": "https://...",
  "created_at": "2025-01-01T00:00:00Z",
  "achievements_count": 12,
  "milestones_count": 25
}
```

---

## Signal Handlers & Automated Features

### Signal Handlers Implemented

#### 1. **User Profile Creation Signal**
- **Trigger**: When new user is created
- **Action**: Automatically creates user Profile
- **Initial Data**: Display name set to user's full name or username

#### 2. **Profile Created Signal**
- **Trigger**: When profile is first created
- **Action**: Creates initial "Welcome to Life OS" milestone

#### 3. **Habit Completion Signal**
- **Trigger**: When user completes a habit
- **Actions**:
  - Checks for habit-related milestones (first_habit, five_habits, ten_habits)
  - Checks for streak milestones (7-day, 30-day, 100-day streaks)
  - Attempts to unlock related achievements

#### 4. **Book Completion Signal**
- **Trigger**: When user marks a book as finished
- **Actions**:
  - Creates reading milestones (first_book, five_books, 1000-pages)
  - Attempts to unlock reading achievements

#### 5. **Goal Completion Signal**
- **Trigger**: When user marks a goal as completed
- **Actions**:
  - Creates goal milestones (first_goal, five_goals, ten_goals)
  - Attempts to unlock goal achievements

### Milestone Types Created Automatically

| Type | Trigger | Title | Icon |
|------|---------|-------|------|
| profile_created | Profile creation | Welcome to Life OS | 🎯 |
| first_habit | First habit created | Your First Habit | 🔥 |
| five_habits | 5+ active habits | Habit Master | 🔥 |
| ten_habits | 10+ active habits | Habit Legend | 🔥 |
| streak_7 | 7-day streak | 7 Day Streak | 🔥 |
| streak_30 | 30-day streak | 30 Day Streak | 🔥 |
| streak_100 | 100-day streak | 100 Day Streak | 🔥 |
| first_book | First book completed | Bookworm | 📚 |
| five_books | 5+ books completed | Reading Enthusiast | 📚 |
| thousand_pages | 1000+ pages read | Page Turner | 📚 |
| first_goal | First goal completed | Goal Setter | 🎯 |
| five_goals | 5+ goals completed | Goal Getter | 🎯 |
| ten_goals | 10+ goals completed | Goal Master | 🎯 |

---

## Key Features Implemented

### 1. **Profile Completion Tracking**
- Automatic calculation of profile completion percentage
- Based on: avatar, bio, country, display name, username, companion selection, email, timezone
- Updates whenever profile is modified

### 2. **Comprehensive Statistics**
- Habit tracking (completions, streaks, current streak)
- Reading analytics (books read, pages, monthly progress)
- Wellness metrics (mood averages, sleep duration)
- Focus session tracking (sessions, completion rates)
- Goal management (active, completed)
- Journal analytics (entries, word count)
- Financial overview (income, expenses, net)

### 3. **Achievement System**
- 8 achievement types supported
- JSON-based unlock conditions for flexibility
- Automatic achievement checking via signal handlers
- Timestamp tracking for unlock moments

### 4. **Milestone Timeline**
- Automatic milestone creation on significant events
- Metadata storage for milestone-related stats
- Ordered chronologically
- Supports custom milestones

### 5. **Activity Tracking**
- Login/logout tracking
- Profile update logging
- Settings change recording
- Device and IP tracking
- Complete activity history

### 6. **Export/Import Functionality**
- **JSON Export**: Complete data backup
- **CSV Export**: User info and statistics
- **PDF Export**: Formatted document (requires reportlab)
- **JSON Import**: Restore previously exported data
- Validation on import

### 7. **Public Profiles**
- Optional public profile sharing
- Limited public data (name, bio, avatar)
- Achievement count display
- Milestone count display
- Controlled by user privacy settings

### 8. **Settings Management**
- Centralized settings endpoint
- Theme preferences (light, dark, system)
- Accent color customization
- Companion preferences
- Notification controls with time scheduling
- Dashboard customization
- Accessibility options
- Privacy controls

---

## Admin Interface

All models have been registered in Django Admin with:

### Profile Admin
- List view showing user, name, timezone, theme, onboarding status, public profile, created date
- Filtering by theme, onboarding status, public profile, creation date
- Search by email, display name, username
- Organized fieldsets for easy management
- Read-only profile completion tracking

### Achievement Admin
- List view showing badge name, user, type, unlock status, dates
- Filtering by type, unlock status, creation date
- Search by user email and badge name
- Organized presentation of unlock conditions

### Milestone Admin
- List view showing title, user, type, achievement date
- Filtering by type and date
- Search by user email and title
- Collapsible metadata section

### AccountActivity Admin
- List view showing user, activity type, description, device, date
- Filtering by activity type and date
- Search by email, description, device, IP
- Collapsible device information section
- Read-only activity details

---

## Database Migrations

### Migration File: 0002_profile_accent_color_..._and_more.py

**Changes Applied:**
1. Added 34 new fields to Profile model
2. Created Achievement model
3. Created Milestone model
4. Created AccountActivity model
5. Modified theme field choices
6. Total: 40+ database changes

**Key Considerations:**
- `username` field allows NULL and blank for unique constraint compatibility
- All notification preferences default to True
- Dashboard layout defaults to 'grid'
- Companion defaults to 'astro'
- Profile completion percentage auto-calculated

---

## API Authentication

All endpoints except auth and public profile require:
- **Method**: Bearer Token Authentication
- **Header**: `Authorization: Bearer {access_token}`
- **Token Format**: JWT from `/api/register/` or login endpoint

---

## Error Handling

### Common Response Codes

| Code | Scenario |
|------|----------|
| 200 | Successful GET/PUT |
| 201 | Successful POST (create) |
| 400 | Bad request or invalid data |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found (user, profile, etc.) |
| 500 | Server error |

### Error Response Format
```json
{
  "error": "Error description"
}
```

---

## File Structure

```
apps/accounts/
├── migrations/
│   ├── __init__.py
│   ├── 0001_initial.py
│   └── 0002_profile_accent_color_..._and_more.py
├── admin.py              # ✅ Updated - All models registered
├── apps.py
├── models.py             # ✅ Updated - Extended with new fields
├── serializers.py        # ✅ Updated - New serializers for endpoints
├── signals.py            # ✅ Updated - Comprehensive signal handlers
├── urls.py               # ✅ Updated - All new routes
├── views.py              # ✅ Updated - 10+ new endpoints
├── __init__.py
└── tests.py
```

---

## Performance Considerations

1. **Database Indexes**: Used on frequently queried fields (user, dates, types)
2. **Signal Optimization**: Signals batch-check conditions to avoid multiple queries
3. **API Response Size**: Statistics endpoint aggregates and computes efficiently
4. **Pagination**: Should be added to list endpoints for large datasets

---

## Security Features Implemented

1. **IP Tracking**: All activities log IP addresses
2. **Device Tracking**: User agent and device name logged
3. **Activity Audit Trail**: Complete history of user actions
4. **Public Profile Control**: Users opt-in to public sharing
5. **Data Export/Import**: Allows user data portability (GDPR compliance)
6. **Permission Enforcement**: All endpoints require authentication (except public profile)

---

## Next Steps for Frontend Integration

1. Create UI for profile detail editing
2. Build statistics dashboard
3. Implement achievement display with unlock notifications
4. Create milestone timeline visualization
5. Add settings panel for all preferences
6. Build activity history view
7. Implement data export/import UI
8. Create public profile showcase

---

## Testing Recommendations

1. **Unit Tests**: Model methods (profile_completion, streak calculation)
2. **Integration Tests**: Signal handlers and milestone creation
3. **API Tests**: All endpoints with various user permissions
4. **Load Tests**: Statistics calculation with large datasets
5. **Security Tests**: IP tracking, activity logging accuracy

---

## Dependencies

- Django 6.0+
- Django REST Framework
- djangorestframework-simplejwt
- python-dotenv
- dj-database-url
- google-auth (for OAuth)
- reportlab (optional, for PDF export)

---

## Deployment Notes

1. Run migrations: `python manage.py migrate accounts`
2. Create superuser for admin: `python manage.py createsuperuser`
3. Collect static files: `python manage.py collectstatic`
4. Configure CORS allowed origins in settings
5. Set `DEBUG = False` in production
6. Use environment variables for sensitive data

---

**Implementation Date**: June 20, 2025
**Status**: ✅ Complete and Ready for Testing
