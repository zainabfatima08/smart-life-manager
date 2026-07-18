# Project Structure Guide - Life Manager

**Last Updated:** July 17, 2026  
**Version:** 1.0

---

## 📁 Root Directory

```
Life Manager/
├── README.md                          ← Start here (main documentation)
├── API.md                             ← API reference
├── SETUP.md                           ← Installation guide
├── .gitignore                         ← Git ignore rules
├── .env.example                       ← Environment template
├── docs/                              ← All documentation
├── backend/                           ← Django application
└── frontend/                          ← Next.js application
```

**Root files kept:** Only 4 essential markdown files
**Storage:** All other docs in `docs/` folder

---

## 📚 Documentation Structure

```
docs/
├── README.md                          ← Documentation index
├── api/                               ← API documentation (ready for content)
├── setup/                             ← Setup guides (ready for content)
└── deployment/                        ← Deployment guides (ready for content)
```

**Note:** When adding documentation:
- Feature guides → `docs/guides/`
- API references → `docs/api/`
- Setup procedures → `docs/setup/`
- Deployment info → `docs/deployment/`

---

## 🔧 Backend Structure

```
backend/
├── life_os/                           ← Main Django project
│   ├── apps/
│   │   ├── accounts/
│   │   │   ├── models.py              ← User models
│   │   │   ├── views.py               ← API views
│   │   │   ├── serializers.py         ← Data serializers
│   │   │   ├── urls.py                ← URL routing
│   │   │   ├── authentication.py      ← Auth logic
│   │   │   ├── auth_views.py          ← Auth endpoints
│   │   │   ├── otp_views.py           ← OTP endpoints
│   │   │   └── signals.py             ← Django signals
│   │   │
│   │   ├── trackers/
│   │   │   ├── models.py              ← Tracker models
│   │   │   ├── views.py               ← Tracker APIs
│   │   │   ├── serializers.py         ← Data serialization
│   │   │   ├── services.py            ← Business logic
│   │   │   └── urls.py                ← URL routing
│   │   │
│   │   ├── ai_companion/
│   │   │   ├── models.py              ← AI models
│   │   │   ├── views.py               ← AI APIs
│   │   │   ├── ai_service.py          ← AI service logic
│   │   │   ├── serializers.py         ← Data serialization
│   │   │   └── urls.py                ← URL routing
│   │   │
│   │   ├── dashboard/
│   │   │   ├── models.py              ← Dashboard models
│   │   │   ├── views.py               ← Dashboard APIs
│   │   │   ├── dashboard_service.py   ← Dashboard logic
│   │   │   └── urls.py                ← URL routing
│   │   │
│   │   └── notifications/
│   │       ├── models.py              ← Notification models
│   │       ├── views.py               ← Notification APIs
│   │       ├── services.py            ← Notification logic
│   │       ├── signals.py             ← Auto-triggers
│   │       └── urls.py                ← URL routing
│   │
│   ├── settings.py                    ← Django settings
│   ├── urls.py                        ← Main URL routing
│   ├── wsgi.py                        ← WSGI configuration
│   └── manage.py                      ← Django CLI
│
├── tests/                             ← Utility & test scripts
│   ├── __init__.py
│   ├── check_constraints.py
│   ├── check_sleep_entries.py
│   ├── clean_database.py
│   ├── delete_all_users.py
│   ├── delete_users.py
│   ├── test_django_email.py
│   ├── test_email_config.py
│   ├── test_email.py
│   ├── test_export.py
│   ├── test_reportlab.py
│   └── test_smtp.py
│
├── Dockerfile                         ← Docker configuration
├── requirements.txt                   ← Python dependencies
├── db.sqlite3                         ← SQLite database
└── .env                               ← Environment variables (NEVER commit)
```

**Backend URLs to add new feature:**
1. Create model in `apps/YOUR_APP/models.py`
2. Create serializer in `apps/YOUR_APP/serializers.py`
3. Create view in `apps/YOUR_APP/views.py`
4. Add URL in `apps/YOUR_APP/urls.py`
5. Register in `life_os/urls.py`

---

## 🎨 Frontend Structure

```
frontend/
├── app/                               ← Next.js 13+ App Router
│   ├── dashboard/
│   │   ├── layout.tsx                 ← Dashboard layout
│   │   ├── page.tsx                   ← Dashboard home
│   │   ├── mood/
│   │   │   └── page.tsx               ← Mood tracker page
│   │   ├── sleep/
│   │   │   └── page.tsx               ← Sleep tracker page
│   │   ├── focus/
│   │   │   └── page.tsx               ← Focus tracker page
│   │   ├── profile/
│   │   │   └── page.tsx               ← Profile page
│   │   ├── settings/
│   │   │   └── page.tsx               ← Settings page
│   │   └── notifications/
│   │       └── page.tsx               ← Notifications page
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx               ← Login page
│   │   ├── register/
│   │   │   └── page.tsx               ← Registration page
│   │   ├── forgot-password/
│   │   │   └── page.tsx               ← Password reset
│   │   ├── reset-password/
│   │   │   └── page.tsx               ← Reset password
│   │   └── callback/
│   │       └── page.tsx               ← OAuth callback
│   │
│   ├── layout.tsx                     ← Root layout (with theme provider)
│   ├── page.tsx                       ← Home page
│   └── globals.css                    ← Global styles
│
├── components/
│   ├── theme-provider.tsx             ← Theme management
│   ├── auth-form.tsx                  ← Auth form component
│   ├── navigation.tsx                 ← Nav component
│   └── ... (other components)
│
├── hooks/
│   ├── useAuth.ts                     ← Auth hook
│   ├── useTheme.ts                    ← Theme hook
│   └── ... (custom hooks)
│
├── lib/
│   ├── auth.ts                        ← Auth utilities
│   ├── api.ts                         ← API client
│   ├── profile.ts                     ← Profile API
│   └── ... (utilities)
│
├── styles/
│   └── ... (CSS modules)
│
├── public/                            ← Static assets
│   └── ... (images, icons)
│
├── next.config.ts                     ← Next.js config (KEEP THIS)
├── postcss.config.js                  ← PostCSS config (KEEP THIS)
├── eslint.config.mjs                  ← ESLint config (KEEP THIS)
├── tsconfig.json                      ← TypeScript config
├── package.json                       ← Dependencies
├── .env.example                       ← Environment template
└── .env.local                         ← Local env (NEVER commit)
```

**Frontend pages to add new feature:**
1. Create page in `app/dashboard/YOUR_FEATURE/page.tsx`
2. Create components in `components/YOUR_FEATURE/`
3. Create hooks if needed in `hooks/useYourFeature.ts`
4. Add API client methods in `lib/api.ts`
5. Add styling as needed

---

## 🚀 Running the Project

### Backend
```bash
cd backend/life_os
python manage.py runserver
# Runs on: http://localhost:8000
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on: http://localhost:3000 (or 3001 if 3000 is taken)
```

### Both Together
```bash
# Terminal 1
cd backend/life_os
python manage.py runserver

# Terminal 2
cd frontend
npm run dev
```

---

## 🔑 Key Files to Know

### Environment Configuration
- `backend/life_os/.env` - Backend environment variables
- `frontend/.env.local` - Frontend environment variables
- `.env.example` - Template (committed to repo)
- `frontend/.env.example` - Template (committed to repo)

**⚠️ IMPORTANT:** Never commit `.env` or `.env.local` files!

### Configuration Files
- `backend/life_os/settings.py` - Django settings
- `frontend/next.config.ts` - Next.js configuration
- `frontend/eslint.config.mjs` - ESLint rules
- `frontend/tsconfig.json` - TypeScript settings

### Database
- `backend/db.sqlite3` - SQLite database file
- `backend/life_os/apps/*/migrations/` - Database migrations

---

## 📝 Adding New Features

### Backend Feature
1. Create app (if needed): `python manage.py startapp feature_name`
2. Define models in `models.py`
3. Create serializers in `serializers.py`
4. Create views in `views.py`
5. Add URLs in `urls.py`
6. Create migration: `python manage.py makemigrations`
7. Apply migration: `python manage.py migrate`
8. Test API endpoints

### Frontend Feature
1. Create page: `app/dashboard/feature_name/page.tsx`
2. Create components: `components/feature_name/`
3. Add API calls in `lib/api.ts`
4. Add styles as needed
5. Test in browser

---

## 🧪 Testing

### Backend
```bash
cd backend/life_os
python manage.py test                # Run all tests
python manage.py test apps.accounts  # Run specific app tests
```

### Frontend
```bash
cd frontend
npm run lint                          # Run ESLint
npm run build                         # Build for production
npm test                             # Run tests (if configured)
```

---

## 📦 Dependencies

### Backend (Python)
- Django 4.2+
- Django REST Framework
- PyJWT
- django-cors-headers
- python-decouple
- reportlab (for PDF exports)
- pyotp (for 2FA)
- qrcode (for 2FA QR codes)

**Update:** Edit `backend/requirements.txt`

### Frontend (Node)
- Next.js 16+
- React 19+
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Recharts
- Axios

**Update:** Edit `frontend/package.json`

---

## 🔐 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] `.env.local` file is in `.gitignore`
- [ ] No secrets in code
- [ ] No API keys in commits
- [ ] CORS properly configured
- [ ] Authentication tokens handled securely
- [ ] Passwords hashed
- [ ] SQL injection prevention (use ORM)
- [ ] XSS protection (React handles this)
- [ ] CSRF tokens used in forms

---

## 📚 Documentation Files

When adding documentation:

| Document Type | Location | Purpose |
|---------------|----------|---------|
| Feature guide | docs/guides/ | Implementation details |
| API docs | docs/api/ | Endpoint documentation |
| Setup guide | docs/setup/ | Installation steps |
| Deployment | docs/deployment/ | Production setup |
| Quick ref | README.md | Quick access info |

---

## 🎯 Common Tasks

### Add new tracker
1. Create model in `apps/trackers/models.py`
2. Create serializer in `apps/trackers/serializers.py`
3. Create view in `apps/trackers/views.py`
4. Add URL in `apps/trackers/urls.py`
5. Create frontend page in `frontend/app/dashboard/[tracker]/page.tsx`

### Fix a bug
1. Locate bug (frontend or backend)
2. Create new branch: `git checkout -b fix/bug-name`
3. Fix the issue
4. Test thoroughly
5. Commit: `git commit -m "fix: description"`
6. Push and create PR

### Add authentication method
1. Update `apps/accounts/authentication.py`
2. Create view in `apps/accounts/auth_views.py`
3. Add URL in `apps/accounts/urls.py`
4. Create frontend component in `components/`
5. Add to auth flow in `lib/auth.ts`

---

## ⚠️ Important Notes

1. **Never push `.env` files** - Use `.env.example` instead
2. **Database migrations** - Always create migrations for model changes
3. **Frontend builds** - Always test `npm run build` before pushing
4. **Backend checks** - Run `python manage.py check` before deploying
5. **Git workflow** - Create feature branches, never push directly to main

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Backend server | `cd backend/life_os && python manage.py runserver` |
| Frontend dev | `cd frontend && npm run dev` |
| Database migration | `cd backend/life_os && python manage.py makemigrations` |
| Database apply | `cd backend/life_os && python manage.py migrate` |
| Django check | `cd backend/life_os && python manage.py check` |
| Lint frontend | `cd frontend && npm run lint` |
| Build frontend | `cd frontend && npm run build` |
| Start backend | `cd backend/life_os && python manage.py runserver 8000` |

---

**Version:** 1.0  
**Last Updated:** July 17, 2026  
**Status:** Production Ready ✅

