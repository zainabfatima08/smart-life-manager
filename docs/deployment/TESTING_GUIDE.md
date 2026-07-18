# Life OS Premium Profile & Settings - Testing Guide

## 📋 Test Plan Overview

This document provides comprehensive testing guidance for all new endpoints and features.

---

## 🧪 Unit Tests

### Test Files Location
```
backend/tests/
├── test_auth.py (existing)
├── test_profile.py (NEW - recommended)
├── test_achievements.py (NEW - recommended)
├── test_milestones.py (NEW - recommended)
└── test_activity.py (NEW - recommended)
```

### Profile Model Tests

#### Test: calculate_profile_completion()
```python
def test_profile_completion_calculation():
    """Test profile completion percentage calculation"""
    user = User.objects.create_user('test@example.com', 'test')
    profile = user.profile
    
    # Initially empty
    assert profile.profile_completion_percent == 0
    
    # Add fields one by one
    profile.avatar_url = "https://example.com/avatar.jpg"
    profile.calculate_profile_completion()
    assert profile.profile_completion_percent == 12  # 1/8
    
    # Add more
    profile.bio = "Test bio"
    profile.country = "US"
    profile.display_name = "Test User"
    profile.username = "testuser"
    profile.calculate_profile_completion()
    assert profile.profile_completion_percent == 62  # 5/8
```

#### Test: Username Uniqueness with NULL
```python
def test_username_uniqueness_with_null():
    """Test that multiple NULL usernames can exist"""
    user1 = User.objects.create_user('user1@example.com', 'user1')
    user2 = User.objects.create_user('user2@example.com', 'user2')
    
    # Both profiles can have null username
    assert user1.profile.username is None
    assert user2.profile.username is None
    
    # Set one username
    user1.profile.username = "testuser1"
    user1.profile.save()
    
    # Uniqueness is enforced
    with pytest.raises(IntegrityError):
        user2.profile.username = "testuser1"
        user2.profile.save()
```

### Achievement Model Tests

#### Test: Achievement Unlock
```python
def test_achievement_unlock():
    """Test achievement unlock workflow"""
    user = User.objects.create_user('test@example.com', 'test')
    
    achievement = Achievement.objects.create(
        user=user,
        badge_name='First Habit',
        achievement_type='habit',
        is_unlocked=False,
        unlock_condition={'type': 'first_habit'}
    )
    
    assert achievement.is_unlocked == False
    assert achievement.unlocked_at is None
    
    # Unlock achievement
    achievement.is_unlocked = True
    achievement.unlocked_at = timezone.now()
    achievement.save()
    
    assert achievement.is_unlocked == True
    assert achievement.unlocked_at is not None
```

### Milestone Model Tests

#### Test: Milestone Creation
```python
def test_milestone_creation():
    """Test milestone creation and ordering"""
    user = User.objects.create_user('test@example.com', 'test')
    
    now = timezone.now()
    
    milestone1 = Milestone.objects.create(
        user=user,
        title='Milestone 1',
        milestone_type='first_habit',
        icon_name='🔥',
        achieved_at=now - timedelta(days=1)
    )
    
    milestone2 = Milestone.objects.create(
        user=user,
        title='Milestone 2',
        milestone_type='streak_7',
        icon_name='🔥',
        achieved_at=now
    )
    
    milestones = Milestone.objects.filter(user=user)
    
    # Should be ordered by achieved_at descending
    assert milestones[0].id == milestone2.id
    assert milestones[1].id == milestone1.id
```

### AccountActivity Model Tests

#### Test: Activity Logging
```python
def test_activity_logging():
    """Test account activity logging"""
    user = User.objects.create_user('test@example.com', 'test')
    
    activity = AccountActivity.objects.create(
        user=user,
        activity_type=AccountActivity.ActivityType.PROFILE_UPDATE,
        description='Profile updated',
        ip_address='192.168.1.1',
        user_agent='Mozilla/5.0',
        device_name='Chrome on Windows'
    )
    
    assert activity.user == user
    assert activity.activity_type == 'profile_update'
    assert activity.created_at is not None
    
    # Test ordering
    activity2 = AccountActivity.objects.create(
        user=user,
        activity_type=AccountActivity.ActivityType.SETTINGS_CHANGE,
        description='Settings changed'
    )
    
    activities = ActivityActivity.objects.filter(user=user)
    assert activities[0].id == activity2.id  # Most recent first
```

---

## 🔗 Integration Tests

### Signal Handler Tests

#### Test: Habit Completion Triggers Milestone
```python
def test_habit_completion_creates_milestone():
    """Test that completing a habit creates milestones"""
    from apps.trackers.models import Habit, HabitCompletion
    
    user = User.objects.create_user('test@example.com', 'test')
    
    habit = Habit.objects.create(
        user=user,
        name='Morning Exercise',
        category='fitness'
    )
    
    # Create first completion
    HabitCompletion.objects.create(
        user=user,
        habit=habit,
        completed_on=timezone.now().date()
    )
    
    # Check for first_habit milestone
    milestone = Milestone.objects.filter(
        user=user,
        milestone_type='first_habit'
    ).first()
    
    assert milestone is not None
    assert milestone.title == 'Your First Habit'
```

#### Test: Streak Milestone Creation
```python
def test_streak_milestone_creation():
    """Test that reaching streak targets creates milestones"""
    from apps.trackers.models import Habit, HabitCompletion
    
    user = User.objects.create_user('test@example.com', 'test')
    habit = Habit.objects.create(user=user, name='Daily Habit')
    
    today = timezone.now().date()
    
    # Create 7 consecutive completions
    for i in range(7):
        HabitCompletion.objects.create(
            user=user,
            habit=habit,
            completed_on=today - timedelta(days=6-i)
        )
    
    # Check for streak_7 milestone
    milestone = Milestone.objects.filter(
        user=user,
        milestone_type='streak_7'
    ).first()
    
    assert milestone is not None
```

#### Test: Achievement Auto-Unlock
```python
def test_achievement_auto_unlock():
    """Test that achievements auto-unlock when conditions are met"""
    from apps.trackers.models import Book
    
    user = User.objects.create_user('test@example.com', 'test')
    
    achievement = Achievement.objects.create(
        user=user,
        badge_name='Bookworm',
        achievement_type='reading',
        is_unlocked=False,
        unlock_condition={'type': 'first_book'}
    )
    
    # Create a finished book
    book = Book.objects.create(
        user=user,
        title='Test Book',
        finished_on=timezone.now().date()
    )
    
    # Manually trigger achievement check
    from apps.accounts.signals import unlock_achievements
    unlock_achievements(user)
    
    achievement.refresh_from_db()
    assert achievement.is_unlocked == True
```

---

## 🚀 API Endpoint Tests

### Profile Detail Endpoint Tests

#### Test: GET /api/profile/detail/ - Unauthorized
```python
def test_profile_detail_unauthorized():
    """Test that unauthorized users cannot access profile detail"""
    client = APIClient()
    
    response = client.get('/api/profile/detail/')
    
    assert response.status_code == 401
    assert 'Authentication credentials were not provided' in str(response.content)
```

#### Test: GET /api/profile/detail/ - Success
```python
def test_profile_detail_get_success():
    """Test successful profile detail retrieval"""
    user = User.objects.create_user('test@example.com', 'password123')
    user.profile.display_name = 'Test User'
    user.profile.bio = 'Test bio'
    user.profile.save()
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/profile/detail/')
    
    assert response.status_code == 200
    data = response.json()
    assert data['display_name'] == 'Test User'
    assert data['bio'] == 'Test bio'
    assert data['email'] == 'test@example.com'
```

#### Test: PUT /api/profile/detail/ - Update
```python
def test_profile_detail_put_update():
    """Test profile detail update"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    data = {
        'display_name': 'Updated Name',
        'bio': 'Updated bio',
        'theme': 'dark',
        'accent_color': 'purple',
        'timezone': 'America/New_York'
    }
    
    response = client.put('/api/profile/detail/', data)
    
    assert response.status_code == 200
    user.profile.refresh_from_db()
    assert user.profile.display_name == 'Updated Name'
    assert user.profile.theme == 'dark'
    
    # Check activity was logged
    activity = AccountActivity.objects.filter(
        user=user,
        activity_type='profile_update'
    ).first()
    assert activity is not None
```

### Statistics Endpoint Tests

#### Test: GET /api/profile/statistics/
```python
def test_statistics_endpoint():
    """Test statistics endpoint returns correct data"""
    from apps.trackers.models import Habit, HabitCompletion, MoodEntry
    
    user = User.objects.create_user('test@example.com', 'password123')
    
    # Create test data
    habit = Habit.objects.create(user=user, name='Test Habit')
    today = timezone.now().date()
    HabitCompletion.objects.create(user=user, habit=habit, completed_on=today)
    
    mood = MoodEntry.objects.create(
        user=user,
        mood='good',
        score=7,
        logged_on=today
    )
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/profile/statistics/')
    
    assert response.status_code == 200
    data = response.json()
    
    assert 'habits' in data
    assert data['habits']['total'] == 1
    assert data['habits']['completed_today'] == 1
    
    assert 'wellness' in data
    assert data['wellness']['mood_score_week_avg'] == 7.0
```

### Settings Endpoint Tests

#### Test: GET /api/settings/
```python
def test_settings_get():
    """Test settings retrieval"""
    user = User.objects.create_user('test@example.com', 'password123')
    profile = user.profile
    profile.theme = 'dark'
    profile.email_notifications = False
    profile.save()
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/settings/')
    
    assert response.status_code == 200
    data = response.json()
    assert data['theme'] == 'dark'
    assert data['email_notifications'] == False
```

#### Test: PUT /api/settings/
```python
def test_settings_put():
    """Test settings update"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    data = {
        'theme': 'light',
        'accent_color': 'green',
        'email_notifications': False,
        'habit_reminder_time': '10:00'
    }
    
    response = client.put('/api/settings/', data)
    
    assert response.status_code == 200
    user.profile.refresh_from_db()
    assert user.profile.theme == 'light'
    assert user.profile.accent_color == 'green'
```

### Achievements Endpoint Tests

#### Test: GET /api/profile/achievements/
```python
def test_achievements_list():
    """Test achievements list endpoint"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    Achievement.objects.create(
        user=user,
        badge_name='Badge 1',
        achievement_type='habit',
        is_unlocked=True,
        unlock_condition={}
    )
    
    Achievement.objects.create(
        user=user,
        badge_name='Badge 2',
        achievement_type='reading',
        is_unlocked=False,
        unlock_condition={}
    )
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/profile/achievements/')
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]['is_unlocked'] == True
    assert data[1]['is_unlocked'] == False
```

#### Test: POST /api/profile/achievements/check/
```python
def test_achievements_check():
    """Test achievement checking endpoint"""
    from apps.trackers.models import Habit
    
    user = User.objects.create_user('test@example.com', 'password123')
    
    achievement = Achievement.objects.create(
        user=user,
        badge_name='First Habit',
        achievement_type='habit',
        is_unlocked=False,
        unlock_condition={'type': 'first_habit'}
    )
    
    # Create first habit
    Habit.objects.create(user=user, name='Test Habit')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.post('/api/profile/achievements/check/')
    
    assert response.status_code == 200
    data = response.json()
    assert data['unlocked_count'] >= 1
```

### Public Profile Endpoint Tests

#### Test: GET /api/profile/public/{username}/ - Not Public
```python
def test_public_profile_not_public():
    """Test accessing non-public profile"""
    user = User.objects.create_user('test@example.com', 'password123')
    user.profile.username = 'testuser'
    user.profile.public_profile = False
    user.profile.save()
    
    client = APIClient()
    
    response = client.get('/api/profile/public/testuser/')
    
    assert response.status_code == 404
```

#### Test: GET /api/profile/public/{username}/ - Public
```python
def test_public_profile_success():
    """Test accessing public profile"""
    user = User.objects.create_user('test@example.com', 'password123')
    user.profile.username = 'testuser'
    user.profile.display_name = 'Test User'
    user.profile.bio = 'Test bio'
    user.profile.public_profile = True
    user.profile.save()
    
    client = APIClient()
    
    response = client.get('/api/profile/public/testuser/')
    
    assert response.status_code == 200
    data = response.json()
    assert data['display_name'] == 'Test User'
    assert data['username'] == 'testuser'
```

### Export/Import Endpoint Tests

#### Test: POST /api/profile/export/ - JSON
```python
def test_export_json():
    """Test data export as JSON"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.post('/api/profile/export/', {'format': 'json'})
    
    assert response.status_code == 200
    assert 'Content-Disposition' in response
    assert 'life_os_export' in response['Content-Disposition']
    
    data = response.json()
    assert 'user' in data
    assert data['user']['email'] == 'test@example.com'
```

#### Test: POST /api/profile/import/
```python
def test_import_data():
    """Test data import"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    import_data = json.dumps({
        'user': {
            'email': 'test@example.com',
            'username': 'testuser'
        },
        'profile': {
            'display_name': 'Imported Name'
        }
    })
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.post(
        '/api/profile/import/',
        {'file': SimpleUploadedFile(
            'export.json',
            import_data.encode('utf-8')
        )},
        format='multipart'
    )
    
    assert response.status_code == 200
```

---

## 📊 Performance Tests

### Load Testing

#### Concurrent User Requests
```python
def test_concurrent_profile_updates():
    """Test concurrent profile updates"""
    from concurrent.futures import ThreadPoolExecutor
    
    user = User.objects.create_user('test@example.com', 'password123')
    client = APIClient()
    client.force_authenticate(user=user)
    
    def update_profile():
        return client.put('/api/profile/detail/', {
            'display_name': f'User {random.randint(1, 100)}'
        })
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(update_profile) for _ in range(100)]
        results = [f.result() for f in futures]
    
    success_count = sum(1 for r in results if r.status_code == 200)
    assert success_count > 95  # Allow some failures
```

### Query Optimization Tests

#### Test: Statistics Query Count
```python
def test_statistics_query_count():
    """Test that statistics endpoint uses reasonable number of queries"""
    from django.test.utils import CaptureQueriesContext
    from django.db import connection
    
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    with CaptureQueriesContext(connection) as context:
        response = client.get('/api/profile/statistics/')
    
    # Should use less than 20 queries
    assert len(context) < 20
```

---

## 🔐 Security Tests

### Authentication Tests

#### Test: Missing Token
```python
def test_missing_token():
    """Test endpoints require authentication"""
    client = APIClient()
    
    endpoints = [
        '/api/profile/detail/',
        '/api/profile/statistics/',
        '/api/settings/',
    ]
    
    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 401
```

#### Test: Invalid Token
```python
def test_invalid_token():
    """Test invalid token rejection"""
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
    
    response = client.get('/api/profile/detail/')
    assert response.status_code == 401
```

### Authorization Tests

#### Test: User Cannot Access Other's Data
```python
def test_user_data_isolation():
    """Test users cannot access other users' data"""
    user1 = User.objects.create_user('user1@example.com', 'password123')
    user2 = User.objects.create_user('user2@example.com', 'password123')
    
    user1.profile.display_name = 'User 1'
    user1.profile.save()
    
    client = APIClient()
    client.force_authenticate(user=user2)
    
    # User2 should get their own profile, not user1's
    response = client.get('/api/profile/detail/')
    data = response.json()
    
    assert data['display_name'] != 'User 1'
```

### Input Validation Tests

#### Test: Invalid Theme Choice
```python
def test_invalid_theme():
    """Test invalid theme selection"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.put('/api/settings/', {
        'theme': 'invalid_theme'
    })
    
    assert response.status_code == 400
```

#### Test: Email Format Validation
```python
def test_invalid_email():
    """Test invalid email format"""
    user = User.objects.create_user('test@example.com', 'password123')
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.put('/api/profile/detail/', {
        'email': 'not_an_email'
    })
    
    # Should fail validation or be read-only
    assert response.status_code != 200
```

---

## 📝 Regression Tests

### Test: Existing Functionality Not Broken

#### Test: Old Profile Endpoint Still Works
```python
def test_legacy_profile_endpoint():
    """Test that old /api/profile/ endpoint still works"""
    user = User.objects.create_user('test@example.com', 'password123')
    user.profile.timezone = 'UTC'
    user.profile.theme = 'light'
    user.profile.save()
    
    client = APIClient()
    client.force_authenticate(user=user)
    
    response = client.get('/api/profile/')
    
    assert response.status_code == 200
    data = response.json()
    assert 'timezone' in data
    assert 'theme' in data
```

---

## ✅ Manual Testing Checklist

### Frontend Integration Testing

- [ ] Profile detail page loads with all fields
- [ ] Update profile triggers activity log
- [ ] Settings panel shows all options
- [ ] Theme change applies immediately
- [ ] Companion preferences save correctly
- [ ] Notification times are customizable
- [ ] Statistics dashboard displays data
- [ ] Achievements display unlock status
- [ ] Milestones show in chronological order
- [ ] Activity history loads and displays
- [ ] Export data as JSON/CSV/PDF
- [ ] Import data from file
- [ ] Public profile can be shared
- [ ] Public profile respects privacy settings

### Admin Panel Testing

- [ ] All models appear in admin
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Read-only fields are protected
- [ ] Fieldsets are organized
- [ ] Can create/edit/delete records
- [ ] Unique constraints are enforced

---

## 🎯 Test Execution Commands

```bash
# Run all tests
python manage.py test apps.accounts

# Run specific test class
python manage.py test apps.accounts.tests.ProfileTestCase

# Run specific test
python manage.py test apps.accounts.tests.ProfileTestCase.test_profile_completion

# Run with verbosity
python manage.py test apps.accounts -v 2

# Run with coverage
coverage run --source='apps.accounts' manage.py test apps.accounts
coverage report

# Run with parallel threads
python manage.py test apps.accounts --parallel
```

---

## 📊 Test Coverage Goals

| Component | Target Coverage |
|-----------|-----------------|
| Models | 95% |
| Views | 90% |
| Serializers | 85% |
| Signals | 90% |
| Overall | 90% |

---

## 🐛 Known Issues to Test

- [ ] NULL username doesn't cause constraint violations
- [ ] Profile completion recalculates correctly
- [ ] Streaks calculated accurately with gaps
- [ ] Timezone affects date calculations
- [ ] Concurrent requests don't cause race conditions
- [ ] Large dataset statistics don't timeout
- [ ] PDF export works with reportlab installed
- [ ] Import validates email match
- [ ] Activity logging captures all updates

---

**Testing Guide**: Complete and ready for execution  
**Last Updated**: June 20, 2025
