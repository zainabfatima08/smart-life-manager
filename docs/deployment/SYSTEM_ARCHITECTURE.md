# Life OS Premium Profile & Settings - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Next.js)                   │
│                                                                 │
│  Profile Page │ Settings Panel │ Statistics │ Achievements     │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     │ HTTP/REST API (JSON)
                     │
┌────────────────────▼──────────────────────────────────────────┐
│                  API LAYER (Django REST)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │          VIEWS (10 Endpoints)                           │  │
│  │  ProfileDetail │ Statistics │ Achievements │ Milestones │  │
│  │  Activity │ Settings │ Export │ Import │ Public Profile │  │
│  └─────────────────────────────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │      SERIALIZERS (Data Validation & Format)             │  │
│  │  ProfileDetailSerializer │ AchievementSerializer │ ...  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │      PERMISSIONS (Authentication & Authorization)       │  │
│  │  IsAuthenticated │ AllowAny (public profiles)            │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         BUSINESS LOGIC (Signal Handlers)                 │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  on_habit_completion                               │  │  │
│  │  │  ├─ check_habit_milestones()                        │  │  │
│  │  │  ├─ unlock_achievements()                           │  │  │
│  │  │  └─ record_activity()                               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  on_book_update                                    │  │  │
│  │  │  ├─ check_reading_milestones()                      │  │  │
│  │  │  └─ unlock_achievements()                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  on_goal_update                                    │  │  │
│  │  │  ├─ check_goal_milestones()                         │  │  │
│  │  │  └─ unlock_achievements()                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Statistics Calculation                            │  │  │
│  │  │  ├─ _calculate_longest_streak()                     │  │  │
│  │  │  ├─ _calculate_current_streak()                     │  │  │
│  │  │  └─ Aggregations (Sum, Avg, Count)                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                      │
│                         ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         DATA MODELS (ORM)                                │  │
│  │                                                          │  │
│  │  User ◄──────── Profile (1:1)                            │  │
│  │   │                                                      │  │
│  │   ├──────────── Achievement (1:M)                        │  │
│  │   │                                                      │  │
│  │   ├──────────── Milestone (1:M)                          │  │
│  │   │                                                      │  │
│  │   └──────────── AccountActivity (1:M)                    │  │
│  │                                                          │  │
│  │  Habit ◄────────── HabitCompletion (1:M)  [trackers app] │  │
│  │  Book ◄─────────── ReadingLog (1:M)       [trackers app] │  │
│  │  Goal ◄─────────── Milestone (1:M)        [trackers app] │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PERSISTENCE LAYER (Database)                   │
│                                                                 │
│  SQLite (Development) / PostgreSQL (Production)                 │
│                                                                 │
│  Tables:                                                        │
│  ├─ accounts_profile (40+ columns)                              │
│  ├─ accounts_achievement (7 columns)                            │
│  ├─ accounts_milestone (7 columns)                              │
│  ├─ accounts_accountactivity (7 columns)                        │
│  ├─ auth_user                                                   │
│  ├─ trackers_habit                                              │
│  ├─ trackers_habitcompletion                                    │
│  ├─ trackers_book                                               │
│  ├─ trackers_readinglog                                         │
│  └─ trackers_goal                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1️⃣ Profile Update Flow

```
┌──────────────┐
│  Frontend    │
│  PUT Request │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ ProfileDetailView.put()  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ProfileDetailSerializer.update()     │
│ - Update Profile fields              │
│ - Update nested User fields          │
│ - Calculate completion percentage    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Profile.save()                   │
│ - Triggers post_save signals     │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ AccountActivity.create()         │
│ - Records PROFILE_UPDATE         │
│ - Logs IP, device, user agent    │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Response 200 OK                  │
│ - Updated profile data           │
└──────────────────────────────────┘
```

### 2️⃣ Habit Completion & Milestone Flow

```
┌──────────────────┐
│ Habit Completed  │
│ (from trackers)  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ on_habit_completion() signal         │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ check_habit_milestones(user)                     │
│ - Calculate current streak                       │
│ - Check milestone conditions:                    │
│   ├─ first_habit (1 habit)                       │
│   ├─ five_habits (5 habits)                      │
│   ├─ ten_habits (10 habits)                      │
│   ├─ streak_7 (7-day streak)                     │
│   ├─ streak_30 (30-day streak)                   │
│   └─ streak_100 (100-day streak)                 │
│ - Create new milestones if not exists            │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ unlock_achievements(user)            │
│ - Check all achievements             │
│ - Evaluate unlock conditions         │
│ - Mark as unlocked if condition met  │
│ - Set unlocked_at timestamp          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Milestones & Achievements        │
│ Updated in Database              │
└──────────────────────────────────┘
```

### 3️⃣ Statistics Calculation Flow

```
┌──────────────────┐
│  GET Statistics  │
│  from Frontend   │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ ProfileStatisticsView.get()          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Query & Aggregate Data:                  │
│ - Habit (count, completions, streaks)    │
│ - Reading (books, pages, logs)           │
│ - Mood (average score last 7 days)       │
│ - Sleep (average duration last 7 days)   │
│ - Focus (sessions, completion rate)      │
│ - Goals (active, completed)              │
│ - Journal (entries, word count)          │
│ - Expenses (income, expenses, net)       │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ Calculate Derived Values:                │
│ - Longest streak (loop through dates)    │
│ - Current streak (backward from today)   │
│ - Averages & totals                      │
│ - Completion rates                       │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Response 200 OK                      │
│ - Comprehensive statistics JSON      │
└──────────────────────────────────────┘
```

---

## 🔄 Entity Relationship Diagram

```
┌─────────────────┐
│   auth_user     │
│─────────────────│
│ id (PK)         │
│ username        │
│ email           │
│ first_name      │
│ last_name       │
│ password        │
│ date_joined     │
└────────┬────────┘
         │ 1
         │
    ┌────▼────┐ 1
    │ Profile │◄─────────────┐
    │─────────│              │
    │ id (PK) │          ┌───┴─────────┐
    │ user_id │          │ (all 40+    │
    │ (FK)    │          │  fields)    │
    └────┬────┘          └─────────────┘
         │ 1
         │
    ┌────┴───────────┬────────────────┬──────────────┐
    │                │                │              │
    1               1                 1              1
    │                │                │              │
┌───▼──────────┐ ┌──▼─────────────┐ ┌▼──────────────┐ ┌▼──────────────┐
│Achievement   │ │Milestone       │ │AccountActivity│ │(Relations to) │
│─────────────│ │─────────────────│ │──────────────│ │  trackers app  │
│ id (PK)     │ │ id (PK)        │ │ id (PK)      │ │               │
│ user_id(FK) │ │ user_id (FK)   │ │ user_id (FK) │ │ Habit ◄─────  │
│ badge_name  │ │ title          │ │ activity_type│ │ Book  ◄─────  │
│ description │ │ description    │ │ description  │ │ Goal  ◄─────  │
│ icon_name   │ │ milestone_type │ │ ip_address   │ └───────────────┘
│ type        │ │ icon_name      │ │ user_agent   │
│ condition   │ │ achieved_at    │ │ device_name  │
│ unlocked_at │ │ metadata       │ │ created_at   │
│ is_unlocked │ └────────────────┘ └──────────────┘
│ created_at  │
└─────────────┘
```

---

## 🛠️ API Request-Response Cycle

```
CLIENT REQUEST
     │
     ▼
┌─────────────────────────────────┐
│ URL ROUTING (urls.py)           │
│ Match URL pattern               │
│ Route to appropriate View class │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ AUTHENTICATION                  │
│ Check JWT token in header       │
│ Verify user permissions         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ VIEW METHOD (GET/POST/PUT)      │
│ Extract request data            │
│ Perform business logic          │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ SERIALIZER VALIDATION           │
│ Validate input data             │
│ Format output data              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ ORM QUERY/UPDATE                │
│ Execute database operation      │
│ Trigger Django signals          │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ SIGNAL HANDLERS                 │
│ Post-save operations            │
│ Milestone/achievement checks    │
│ Activity logging                │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ RESPONSE CONSTRUCTION           │
│ Status code (200, 201, 400...)  │
│ JSON serialization              │
└──────────┬──────────────────────┘
           │
           ▼
CLIENT RESPONSE
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│               SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: AUTHENTICATION                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ JWT Token-based Authentication                   │   │
│  │ - Access tokens with expiration                  │   │
│  │ - Refresh tokens for renewal                     │   │
│  │ - Bearer token in Authorization header           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 2: AUTHORIZATION                                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Permission Classes                               │   │
│  │ - IsAuthenticated (most endpoints)               │   │
│  │ - AllowAny (public profiles, auth endpoints)     │   │
│  │ - User-owned data validation                     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 3: INPUT VALIDATION                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Serializer Validation                            │   │
│  │ - Field type checking                            │   │
│  │ - Length constraints                             │   │
│  │ - Choice validation                              │   │
│  │ - Custom validators                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 4: DATA ACCESS CONTROL                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Privacy Settings                                 │   │
│  │ - public_profile flag                            │   │
│  │ - show_achievements_public                       │   │
│  │ - show_stats_public                              │   │
│  │ - User data isolation in queries                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 5: AUDIT & LOGGING                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │ AccountActivity Tracking                         │   │
│  │ - IP address logging                             │   │
│  │ - Device/user agent tracking                     │   │
│  │ - Activity type classification                   │   │
│  │ - Timestamp recording                            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  Layer 6: DATA INTEGRITY                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Database Constraints                             │   │
│  │ - Unique constraints                             │   │
│  │ - Foreign key relationships                      │   │
│  │ - NOT NULL constraints                           │   │
│  │ - CHECK constraints (e.g., ratings 1-10)         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Architecture

```
┌─────────────────────────────────────────────────────┐
│           SCALABILITY CONSIDERATIONS                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  READ-INTENSIVE OPERATIONS:                         │
│  ├─ Database Indexing                              │
│  │  ├─ Index on (user, created_at)                │
│  │  ├─ Index on (user, is_unlocked)               │
│  │  └─ Index on activity_type                     │
│  │                                                 │
│  └─ Query Optimization                             │
│     ├─ select_related() for FKs                    │
│     ├─ prefetch_related() for M2M                  │
│     └─ Aggregation queries (Sum, Avg)             │
│                                                     │
│  WRITE-HEAVY OPERATIONS:                            │
│  ├─ Batch Operations                               │
│  │  ├─ bulk_create() for multiple achievements    │
│  │  └─ bulk_update() for status changes           │
│  │                                                 │
│  └─ Signal Optimization                            │
│     ├─ Lazy signal handlers                        │
│     └─ Batch condition checking                    │
│                                                     │
│  CACHING STRATEGY:                                  │
│  ├─ Statistics endpoint results                    │
│  ├─ Public profile data                            │
│  └─ Achievement lists                              │
│                                                     │
│  DATABASE SCALING:                                  │
│  ├─ Read replicas for statistics                  │
│  ├─ Connection pooling                             │
│  └─ Partitioning by user (future)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

### With Trackers App
```
accounts/signals.py
    │
    ├─ on_habit_completion()
    │   └─ Listens to: trackers.HabitCompletion.post_save
    │       └─ Calls: check_habit_milestones()
    │
    ├─ on_book_update()
    │   └─ Listens to: trackers.Book.post_save
    │       └─ Calls: check_reading_milestones()
    │
    └─ on_goal_update()
        └─ Listens to: trackers.Goal.post_save
            └─ Calls: check_goal_milestones()
```

### With Dashboard App
```
Statistics view provides data for:
├─ Dashboard summary widgets
├─ Health overview cards
└─ Trend charts & graphs
```

### With Frontend
```
All endpoints return JSON:
├─ Profile (CRUD)
├─ Statistics (Read)
├─ Achievements (List, Check)
├─ Milestones (List)
├─ Activity (List)
├─ Settings (Read, Update)
├─ Export/Import (File handling)
└─ Public Profile (Read)
```

---

## 📊 Performance Characteristics

```
ENDPOINT PERFORMANCE:

GET /profile/detail/
├─ Database Queries: 3 (Profile, User, related data)
├─ Response Time: ~50ms
└─ Cacheable: Yes (per user)

GET /profile/statistics/
├─ Database Queries: 8-10 (aggregations)
├─ Response Time: ~200-300ms
├─ Cacheable: Yes (1 hour TTL recommended)
└─ Optimization: Use read replica

GET /profile/achievements/
├─ Database Queries: 2 (User query + achievements)
├─ Response Time: ~50ms
└─ Cacheable: Yes (until new unlock)

POST /profile/achievements/check/
├─ Database Queries: 15+ (condition checking)
├─ Response Time: ~300-500ms
├─ Cacheable: No (real-time checking)
└─ Optimization: Consider async task

GET /profile/activity/
├─ Database Queries: 2 (with pagination)
├─ Response Time: ~50ms
└─ Pagination: Recommended (20-50 per page)

GET /profile/public/{username}/
├─ Database Queries: 2 (Profile + counts)
├─ Response Time: ~50ms
├─ Cacheable: Yes (aggressive, 24h TTL)
└─ Rate Limit: Public endpoint, consider limiting

PUT /settings/
├─ Database Queries: 2 (Query + Update)
├─ Response Time: ~50ms
├─ Signal Triggers: AccountActivity.create()
└─ Side Effects: Activity logging
```

---

**Architecture Design**: Scalable, modular, secure  
**Last Updated**: June 20, 2025
