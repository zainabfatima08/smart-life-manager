# Life OS - API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All tracker endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Authentication Endpoints

#### Register
```http
POST /auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "strongpassword123",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login (Get JWT Token)
```http
POST /auth/token/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strongpassword123"
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Refresh Token
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Request Password Reset
```http
POST /auth/password-reset/
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset email sent"
}
```

---

## Mood Tracker API

### List Mood Entries
```http
GET /mood/
GET /mood/?page=2
GET /mood/?search=happy
GET /mood/?start=2024-01-01&end=2024-01-31
GET /mood/?mood=great

Response: 200 OK
{
  "count": 50,
  "next": "http://localhost:8000/api/mood/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "mood": "great",
      "emoji": "🤩",
      "label": "Radiant",
      "score": 9,
      "note": "Had an amazing day!",
      "logged_on": "2024-01-15",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Query Parameters:**
- `page`: Page number (pagination)
- `search`: Search in label and note fields
- `start`: Filter entries after this date (YYYY-MM-DD)
- `end`: Filter entries before this date (YYYY-MM-DD)
- `mood`: Filter by mood type (great, good, okay, low, bad)

### Create Mood Entry
```http
POST /mood/
Authorization: Bearer <token>
Content-Type: application/json

{
  "mood": "great",
  "emoji": "🤩",
  "label": "Radiant",
  "score": 9,
  "note": "Had an amazing productive day!",
  "logged_on": "2024-01-15"
}

Response: 201 Created
{
  "id": 1,
  "mood": "great",
  "emoji": "🤩",
  "label": "Radiant",
  "score": 9,
  "note": "Had an amazing productive day!",
  "logged_on": "2024-01-15",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Validation:**
- `mood`: Required, choices: great, good, okay, low, bad
- `emoji`: Required, max 16 characters
- `label`: Required, max 60 characters
- `score`: Required, integer 1-10
- `note`: Optional, text
- `logged_on`: Required, date format (YYYY-MM-DD)
- **Constraint:** One mood entry per user per day

### Get Mood Entry
```http
GET /mood/{id}/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "mood": "great",
  "emoji": "🤩",
  "label": "Radiant",
  "score": 9,
  "note": "Had an amazing productive day!",
  "logged_on": "2024-01-15",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Mood Entry
```http
PATCH /mood/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 10,
  "note": "Updated note - even better now!"
}

Response: 200 OK
{
  "id": 1,
  "mood": "great",
  "emoji": "🤩",
  "label": "Radiant",
  "score": 10,
  "note": "Updated note - even better now!",
  "logged_on": "2024-01-15",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T15:45:00Z"
}
```

### Delete Mood Entry
```http
DELETE /mood/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

### Get Mood Statistics
```http
GET /mood/stats/
Authorization: Bearer <token>

Response: 200 OK
{
  "total_entries": 50,
  "average_score": 7.2,
  "weekly_average": 7.5,
  "monthly_average": 7.3,
  "current_streak": 15,
  "latest": {
    "mood": "great",
    "emoji": "🤩",
    "label": "Radiant",
    "score": 9,
    "logged_on": "2024-01-15"
  },
  "best_mood": {
    "mood": "great",
    "emoji": "🤩",
    "label": "Radiant",
    "score": 10,
    "logged_on": "2024-01-10"
  },
  "distribution": [
    {"mood": "great", "label": "Radiant", "emoji": "🤩", "total": 15},
    {"mood": "good", "label": "Steady", "emoji": "🙂", "total": 20},
    {"mood": "okay", "label": "Neutral", "emoji": "😐", "total": 10},
    {"mood": "low", "label": "Low", "emoji": "😔", "total": 3},
    {"mood": "bad", "label": "Heavy", "emoji": "😣", "total": 2}
  ],
  "weekly": [
    {"logged_on": "2024-01-08", "avg_score": 7.0, "entries": 1},
    {"logged_on": "2024-01-09", "avg_score": 8.0, "entries": 1}
  ],
  "monthly": [
    {"logged_on": "2024-01-01", "avg_score": 6.5, "entries": 1}
  ],
  "recent_notes": [...]
}
```

### Get Mood Trends
```http
GET /mood/trends/?period=weekly
GET /mood/trends/?period=monthly
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "period": "2024-01-08T00:00:00Z",
    "avg_score": 7.2,
    "entries": 7
  },
  {
    "period": "2024-01-15T00:00:00Z",
    "avg_score": 7.8,
    "entries": 7
  }
]
```

### Get Mood Calendar
```http
GET /mood/calendar/?start=2024-01-01&end=2024-01-31
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "logged_on": "2024-01-15",
    "mood": "great",
    "emoji": "🤩",
    "label": "Radiant",
    "score": 9,
    "note": "Had an amazing day!"
  }
]
```

---

## Sleep Tracker API

### List Sleep Entries
```http
GET /sleep/
GET /sleep/?page=2
GET /sleep/?start=2024-01-01&end=2024-01-31
GET /sleep/?search=interrupted

Response: 200 OK
{
  "count": 30,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "slept_on": "2024-01-15",
      "duration_minutes": 480,
      "quality": 8,
      "bedtime": "23:00:00",
      "wake_time": "07:00:00",
      "note": "Slept well, no interruptions",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### Create Sleep Entry
```http
POST /sleep/
Authorization: Bearer <token>
Content-Type: application/json

{
  "slept_on": "2024-01-15",
  "duration_minutes": 480,
  "quality": 8,
  "bedtime": "23:00",
  "wake_time": "07:00",
  "note": "Slept well, no interruptions"
}

Response: 201 Created
{
  "id": 1,
  "slept_on": "2024-01-15",
  "duration_minutes": 480,
  "quality": 8,
  "bedtime": "23:00:00",
  "wake_time": "07:00:00",
  "note": "Slept well, no interruptions",
  "created_at": "2024-01-15T08:00:00Z",
  "updated_at": "2024-01-15T08:00:00Z"
}
```

**Validation:**
- `slept_on`: Required, date format (YYYY-MM-DD)
- `duration_minutes`: Required, integer 1-1440 (24 hours max)
- `quality`: Required, integer 1-10
- `bedtime`: Optional, time format (HH:MM)
- `wake_time`: Optional, time format (HH:MM)
- `note`: Optional, text
- **Constraint:** One sleep entry per user per day

### Get Sleep Entry
```http
GET /sleep/{id}/
Authorization: Bearer <token>

Response: 200 OK
{...}
```

### Update Sleep Entry
```http
PATCH /sleep/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "quality": 9,
  "note": "Actually slept even better than I thought"
}

Response: 200 OK
{...}
```

### Delete Sleep Entry
```http
DELETE /sleep/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

### Get Sleep Statistics
```http
GET /sleep/stats/
Authorization: Bearer <token>

Response: 200 OK
{
  "total_entries": 30,
  "weekly_average_minutes": 450,
  "monthly_average_minutes": 460,
  "weekly_average_quality": 7.5,
  "monthly_average_quality": 7.3,
  "current_streak": 10,
  "latest": {
    "id": 1,
    "slept_on": "2024-01-15",
    "duration_minutes": 480,
    "quality": 8,
    "bedtime": "23:00:00",
    "wake_time": "07:00:00",
    "note": "..."
  },
  "best_sleep": {
    "id": 5,
    "slept_on": "2024-01-10",
    "duration_minutes": 510,
    "quality": 10,
    ...
  },
  "daily": [...],
  "weekly": [...],
  "monthly": [...]
}
```

### Get Sleep Trends
```http
GET /sleep/trends/?period=weekly
GET /sleep/trends/?period=monthly
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "period": "2024-01-08T00:00:00Z",
    "avg_minutes": 450,
    "avg_quality": 7.5,
    "entries": 7
  }
]
```

### Get Sleep Report
```http
GET /sleep/report/?period=weekly
GET /sleep/report/?period=monthly
Authorization: Bearer <token>

Response: 200 OK
{
  "period": "weekly",
  "start": "2024-01-08",
  "end": "2024-01-14",
  "entries": 7,
  "average_duration_minutes": 450,
  "average_quality": 7.5,
  "nights": [
    {
      "id": 1,
      "slept_on": "2024-01-08",
      "duration_minutes": 480,
      "quality": 8,
      "bedtime": "23:00:00",
      "wake_time": "07:00:00",
      "note": "..."
    }
  ]
}
```

### Get Sleep Calendar
```http
GET /sleep/calendar/?start=2024-01-01&end=2024-01-31
Authorization: Bearer <token>

Response: 200 OK
[...]
```

---

## Focus Tracker API

### List Focus Sessions
```http
GET /focus/
GET /focus/?page=2
GET /focus/?subject=Mathematics
GET /focus/?session_type=pomodoro
GET /focus/?completed=true
GET /focus/?start=2024-01-01&end=2024-01-31

Response: 200 OK
{
  "count": 100,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "subject": "Mathematics",
      "session_type": "pomodoro",
      "started_at": "2024-01-15T10:00:00Z",
      "ended_at": "2024-01-15T10:25:00Z",
      "duration_minutes": 25,
      "completed": true,
      "productivity_rating": 8,
      "notes": "Worked on calculus problems",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:25:00Z"
    }
  ]
}
```

**Query Parameters:**
- `subject`: Filter by subject (case-insensitive contains)
- `session_type`: Filter by type (pomodoro, deep_work, study, review)
- `completed`: Filter by completion status (true/false)
- `start`: Filter sessions after this datetime
- `end`: Filter sessions before this datetime

### Create Focus Session
```http
POST /focus/
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Mathematics",
  "session_type": "pomodoro",
  "started_at": "2024-01-15T10:00:00Z",
  "duration_minutes": 25,
  "completed": false,
  "productivity_rating": 7,
  "notes": "Planning to work on calculus"
}

Response: 201 Created
{
  "id": 1,
  "subject": "Mathematics",
  "session_type": "pomodoro",
  "started_at": "2024-01-15T10:00:00Z",
  "ended_at": null,
  "duration_minutes": 25,
  "completed": false,
  "productivity_rating": 7,
  "notes": "Planning to work on calculus",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

**Validation:**
- `subject`: Required, max 120 characters
- `session_type`: Required, choices: pomodoro, deep_work, study, review
- `started_at`: Required, datetime (ISO 8601)
- `ended_at`: Optional, datetime
- `duration_minutes`: Required, integer 1-720 (12 hours max)
- `completed`: Required, boolean
- `productivity_rating`: Required, integer 1-10
- `notes`: Optional, text

### Get Focus Session
```http
GET /focus/{id}/
Authorization: Bearer <token>

Response: 200 OK
{...}
```

### Update Focus Session
```http
PATCH /focus/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "productivity_rating": 9,
  "notes": "Actually got more done than expected!"
}

Response: 200 OK
{...}
```

### Delete Focus Session
```http
DELETE /focus/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

### Complete Focus Session
```http
POST /focus/{id}/complete/
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true,
  "ended_at": "2024-01-15T10:25:00Z",
  "productivity_rating": 8,
  "notes": "Completed all tasks"
}

Response: 200 OK
{
  "id": 1,
  "subject": "Mathematics",
  "session_type": "pomodoro",
  "started_at": "2024-01-15T10:00:00Z",
  "ended_at": "2024-01-15T10:25:00Z",
  "duration_minutes": 25,
  "completed": true,
  "productivity_rating": 8,
  "notes": "Completed all tasks",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:25:00Z"
}
```

### Get Focus Statistics
```http
GET /focus/stats/
Authorization: Bearer <token>

Response: 200 OK
{
  "total_sessions": 100,
  "completed_sessions": 85,
  "today_minutes": 75,
  "weekly_minutes": 450,
  "monthly_minutes": 1800,
  "total_minutes": 5000,
  "average_productivity": 7.5,
  "current_streak": 5,
  "by_subject": [
    {"subject": "Mathematics", "minutes": 600, "sessions": 24},
    {"subject": "Programming", "minutes": 900, "sessions": 30}
  ],
  "by_type": [
    {"session_type": "pomodoro", "minutes": 1500, "sessions": 60},
    {"session_type": "deep_work", "minutes": 2700, "sessions": 30}
  ],
  "daily": [
    {
      "day": "2024-01-15",
      "minutes": 75,
      "sessions": 3,
      "avg_productivity": 7.5
    }
  ],
  "recent": [...]
}
```

### Get Focus Trends
```http
GET /focus/trends/?period=weekly
GET /focus/trends/?period=monthly
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "period": "2024-01-08T00:00:00Z",
    "minutes": 450,
    "sessions": 18,
    "avg_productivity": 7.5
  }
]
```

### Get Focus Calendar
```http
GET /focus/calendar/?start=2024-01-01&end=2024-01-31
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "subject": "Mathematics",
    "session_type": "pomodoro",
    "started_at": "2024-01-15T10:00:00Z",
    "duration_minutes": 25,
    "completed": true,
    "productivity_rating": 8
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "another_field": ["Another error"]
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
  "detail": "Internal server error."
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production, consider:
- 100 requests per minute per user
- Stricter limits for anonymous users
- Token refresh endpoint protection

---

## Pagination

All list endpoints use pagination:
- Default page size: 20 items
- Access other pages: `?page=2`
- Response includes:
  - `count`: Total number of items
  - `next`: URL to next page (null if last page)
  - `previous`: URL to previous page (null if first page)
  - `results`: Array of items

---

## Filtering & Search

### Date Filtering
```
?start=2024-01-01&end=2024-01-31
```

### Search
```
?search=query
```
Searches in relevant text fields (notes, labels, subjects)

### Field Filtering
```
?mood=great
?session_type=pomodoro
?completed=true
```

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Use ISO 8601 format** for dates and datetimes
3. **Handle token refresh** on 401 responses
4. **Validate input** on the client before sending
5. **Use pagination** for large datasets
6. **Cache statistics** where appropriate
7. **Handle errors gracefully** with user-friendly messages

---

## Example Integration

```typescript
// TypeScript example
const API_BASE = 'http://localhost:8000/api';

async function createMoodEntry(token: string, data: MoodEntry) {
  const response = await fetch(`${API_BASE}/mood/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create mood entry');
  }
  
  return response.json();
}
```

---

For more details, see the [full documentation](README.md) and [setup guide](SETUP.md).
