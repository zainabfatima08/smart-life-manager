# Life OS Premium Profile & Settings API - Quick Reference

## Base URL
```
http://localhost:8000/api/
```

## Authentication
```
Header: Authorization: Bearer {access_token}
```

## Endpoints Summary

### 1️⃣ Profile Details
```
GET  /profile/detail/
PUT  /profile/detail/
```
Get and update all profile info and settings

### 2️⃣ Statistics Dashboard
```
GET  /profile/statistics/
```
Get comprehensive life stats (habits, reading, wellness, focus, goals, journal, finance)

### 3️⃣ Achievements
```
GET  /profile/achievements/
POST /profile/achievements/check/
```
List achievements and check for new unlocks

### 4️⃣ Milestones Timeline
```
GET  /profile/milestones/
```
Get user's milestone journey

### 5️⃣ Activity History
```
GET  /profile/activity/
```
Get account activity log (logins, updates, etc.)

### 6️⃣ Settings
```
GET  /settings/
PUT  /settings/
```
Manage all user settings (theme, notifications, accessibility, etc.)

### 7️⃣ Data Export
```
POST /profile/export/
```
Export data as JSON, CSV, or PDF

### 8️⃣ Data Import
```
POST /profile/import/
```
Import previously exported data

### 9️⃣ Public Profile
```
GET  /profile/public/{username}/
```
View public profile (no auth required)

---

## Example Requests

### Get Profile Details
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/profile/detail/
```

### Update Profile
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Jane Doe",
    "bio": "Life enthusiast",
    "timezone": "America/New_York",
    "theme": "dark"
  }' \
  http://localhost:8000/api/profile/detail/
```

### Get Statistics
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/profile/statistics/
```

### Check Achievements
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/profile/achievements/check/
```

### Update Settings
```bash
curl -X PUT \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_notifications": false,
    "habit_reminder_time": "10:00",
    "accent_color": "purple"
  }' \
  http://localhost:8000/api/settings/
```

### Export Data (JSON)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format": "json"}' \
  http://localhost:8000/api/profile/export/ \
  > export.json
```

### Export Data (CSV)
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format": "csv"}' \
  http://localhost:8000/api/profile/export/ \
  > export.csv
```

### Import Data
```bash
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@export.json" \
  http://localhost:8000/api/profile/import/
```

### Get Public Profile
```bash
curl http://localhost:8000/api/profile/public/johndoe/
```

---

## Response Examples

### Profile Detail Response
```json
{
  "user_id": "1",
  "display_name": "John Doe",
  "username": "johndoe",
  "bio": "Life enthusiast",
  "avatar_url": "https://...",
  "banner_url": "https://...",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "country": "US",
  "timezone": "America/New_York",
  "preferred_language": "en",
  "theme": "dark",
  "accent_color": "blue",
  "selected_companion": "astro",
  "show_companion": true,
  "companion_speech_bubbles": true,
  "companion_animation_speed": 1,
  "companion_sound_effects": true,
  "public_profile": false,
  "profile_completion_percent": 75,
  "created_at": "2025-01-01T00:00:00Z",
  "email_notifications": true,
  "browser_notifications": true,
  "habit_reminders": true,
  "goal_reminders": true,
  "dashboard_layout": "grid",
  "animations_enabled": true,
  "font_size": "normal",
  "reduced_motion": false,
  "high_contrast": false
}
```

### Statistics Response
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

### Achievements Response
```json
[
  {
    "id": 1,
    "badge_name": "Your First Habit",
    "description": "Created your first habit",
    "icon_name": "🔥",
    "achievement_type": "habit",
    "is_unlocked": true,
    "unlocked_at": "2025-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "badge_name": "Habit Master",
    "description": "Created 5 active habits",
    "icon_name": "🔥",
    "achievement_type": "habit",
    "is_unlocked": true,
    "unlocked_at": "2025-02-20T14:30:00Z"
  }
]
```

### Milestones Response
```json
[
  {
    "id": 1,
    "title": "Welcome to Life OS",
    "description": "Your journey begins here",
    "milestone_type": "profile_created",
    "icon_name": "🎯",
    "achieved_at": "2025-01-01T00:00:00Z",
    "metadata": {"profile_completion": 0}
  },
  {
    "id": 2,
    "title": "Your First Habit",
    "description": "Created your first habit",
    "milestone_type": "first_habit",
    "icon_name": "🔥",
    "achieved_at": "2025-01-15T10:00:00Z",
    "metadata": {"habit_count": 1}
  }
]
```

### Activity Response
```json
[
  {
    "id": 1,
    "activity_type": "profile_update",
    "description": "Profile updated",
    "device_name": "Chrome on Windows",
    "ip_address": "192.168.1.1",
    "created_at": "2025-06-20T14:00:00Z"
  },
  {
    "id": 2,
    "activity_type": "settings_change",
    "description": "Settings updated",
    "device_name": "Safari on iPhone",
    "ip_address": "203.0.113.45",
    "created_at": "2025-06-20T13:30:00Z"
  }
]
```

### Settings Response
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

### Public Profile Response
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

## Settings Fields

### Theme
- `light` - Light mode
- `dark` - Dark mode
- `system` - System preference

### Accent Color
- `blue` - Blue accent
- `indigo` - Indigo accent
- `purple` - Purple accent
- `pink` - Pink accent
- `green` - Green accent

### Companion
- `astro` - Astro companion
- `nova` - Nova companion
- `ember` - Ember companion

### Animation Speed
- `1` - Normal
- `2` - Fast
- `3` - Faster

### Dashboard Layout
- `grid` - Grid layout
- `compact` - Compact layout

### Font Size
- `small` - Small font
- `normal` - Normal font
- `large` - Large font

---

## Activity Types
- `login` - User logged in
- `logout` - User logged out
- `password_change` - Password changed
- `email_change` - Email address changed
- `device_login` - New device login
- `profile_update` - Profile updated
- `settings_change` - Settings changed

---

## Achievement Types
- `habit` - Habit achievements
- `mood` - Mood/wellness achievements
- `sleep` - Sleep tracking achievements
- `focus` - Focus session achievements
- `reading` - Reading/book achievements
- `expense` - Finance/expense achievements
- `journal` - Journal writing achievements
- `goal` - Goal completion achievements

---

## Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid data |
| 401 | Unauthorized - Missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

---

## Error Handling

### Typical Error Response
```json
{
  "error": "Detailed error message"
}
```

### Common Errors

**Missing Token**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Invalid Format**
```json
{
  "error": "Invalid JSON format"
}
```

**Not Found**
```json
{
  "error": "Profile not found or not public"
}
```

---

## Tips & Best Practices

1. **Token Management**: Store JWT tokens securely
2. **Pagination**: Add `?page=1&page_size=20` for list endpoints
3. **Filtering**: Use query parameters for filtering (future enhancement)
4. **Caching**: Cache statistics responses as they're compute-intensive
5. **Error Handling**: Always check response status codes
6. **Rate Limiting**: Implement rate limiting for export operations
7. **Data Privacy**: Respect user privacy settings before displaying data

---

**Last Updated**: June 20, 2025
