from __future__ import annotations

from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable

from django.db.models import Avg, Count, QuerySet, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from .models import (
    Book,
    ExpenseEntry,
    FocusSession,
    Goal,
    Habit,
    HabitCompletion,
    JournalEntry,
    LifeExperienceEvent,
    Milestone,
    MoodEntry,
    ReadingLog,
    SleepEntry,
)

HABIT_COMPLETION_XP = 20


def date_range(days: int = 30) -> tuple[date, date]:
    from datetime import date
    end = date.today()
    return end - timedelta(days=days - 1), end


def calculate_streak(dates: Iterable[date]) -> dict[str, int]:
    ordered = sorted(set(dates))
    if not ordered:
        return {'current': 0, 'longest': 0}

    longest = 1
    run = 1
    for index in range(1, len(ordered)):
        if ordered[index] == ordered[index - 1] + timedelta(days=1):
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    today = date.today()
    cursor = today if today in ordered else today - timedelta(days=1)
    current = 0
    date_set = set(ordered)
    while cursor in date_set:
        current += 1
        cursor -= timedelta(days=1)

    return {'current': current, 'longest': longest}


def habit_streaks(habit: Habit) -> dict[str, int]:
    dates = habit.completions.values_list('completed_on', flat=True)
    return calculate_streak(dates)


def award_xp(user, *, source: str, source_id: int, points: int, reason: str, earned_on: date | None = None) -> LifeExperienceEvent:
    from datetime import date as date_class
    event, _created = LifeExperienceEvent.objects.get_or_create(
        user=user,
        source=source,
        source_id=source_id,
        earned_on=earned_on or date_class.today(),
        reason=reason,
        defaults={'points': points},
    )
    return event


def remove_xp(user, *, source: str, source_id: int, reason: str, earned_on: date) -> None:
    LifeExperienceEvent.objects.filter(
        user=user,
        source=source,
        source_id=source_id,
        earned_on=earned_on,
        reason=reason,
    ).delete()


def create_habit_completion(*, user, habit: Habit, completed_on: date, note: str = '') -> tuple[HabitCompletion, bool]:
    completion, created = HabitCompletion.objects.get_or_create(
        user=user,
        habit=habit,
        completed_on=completed_on,
        defaults={'note': note},
    )
    if created:
        award_xp(
            user,
            source=LifeExperienceEvent.Source.HABIT,
            source_id=completion.id,
            points=HABIT_COMPLETION_XP,
            reason='Habit completed',
            earned_on=completed_on,
        )
    elif note and completion.note != note:
        completion.note = note
        completion.save(update_fields=['note', 'updated_at'])
    return completion, created


def delete_habit_completion(completion: HabitCompletion) -> None:
    remove_xp(
        completion.user,
        source=LifeExperienceEvent.Source.HABIT,
        source_id=completion.id,
        reason='Habit completed',
        earned_on=completion.completed_on,
    )
    completion.delete()


def experience_summary(user) -> dict:
    from datetime import date as date_class
    today = date_class.today()
    week_start = today - timedelta(days=today.weekday())
    events = LifeExperienceEvent.objects.filter(user=user)
    total_xp = events.aggregate(total=Sum('points'))['total'] or 0
    level = int(total_xp // 500) + 1
    level_floor = (level - 1) * 500
    return {
        'total_xp': total_xp,
        'level': level,
        'level_progress': total_xp - level_floor,
        'level_target': 500,
        'daily_xp': events.filter(earned_on=today).aggregate(total=Sum('points'))['total'] or 0,
        'weekly_xp': events.filter(earned_on__gte=week_start).aggregate(total=Sum('points'))['total'] or 0,
        'recent': list(events.values('source', 'points', 'reason', 'earned_on').order_by('-earned_on', '-created_at')[:10]),
    }


def habit_categories() -> list[dict[str, str]]:
    return [{'value': value, 'label': label} for value, label in Habit.Category.choices]


def habit_calendar(user, *, start: date | None = None, end: date | None = None) -> list[dict]:
    completions = HabitCompletion.objects.filter(user=user).select_related('habit')
    if start:
        completions = completions.filter(completed_on__gte=start)
    if end:
        completions = completions.filter(completed_on__lte=end)
    return [
        {
            'id': completion.id,
            'habit_id': completion.habit_id,
            'habit_name': completion.habit.name,
            'category': completion.habit.category,
            'color': completion.habit.color,
            'completed_on': completion.completed_on.isoformat() if completion.completed_on else None,
            'note': completion.note,
            'xp': HABIT_COMPLETION_XP,
        }
        for completion in completions.order_by('completed_on', 'habit__name')
    ]


def habit_stats(user) -> dict:
    from datetime import date as date_class
    start, end = date_range(30)
    habits = Habit.objects.filter(user=user).prefetch_related('completions')
    completions = HabitCompletion.objects.filter(user=user, completed_on__range=(start, end))
    today = date_class.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    active_count = habits.filter(is_active=True).count()
    calendar = [
        {
            'completed_on': item['completed_on'].isoformat() if item['completed_on'] else None,
            'count': item['count'],
        }
        for item in completions.values('completed_on')
        .annotate(count=Count('id'))
        .order_by('completed_on')
    ]
    weekly = [
        {
            'completed_on': item['completed_on'].isoformat() if item['completed_on'] else None,
            'count': item['count'],
        }
        for item in HabitCompletion.objects.filter(user=user, completed_on__gte=week_start)
        .values('completed_on')
        .annotate(count=Count('id'))
        .order_by('completed_on')
    ]
    monthly = [
        {
            'completed_on': item['completed_on'].isoformat() if item['completed_on'] else None,
            'count': item['count'],
        }
        for item in HabitCompletion.objects.filter(user=user, completed_on__gte=month_start)
        .values('completed_on')
        .annotate(count=Count('id'))
        .order_by('completed_on')
    ]
    by_category = list(habits.values('category').annotate(total=Count('id')).order_by('category'))
    top_streaks = sorted(
        [
            {
                'id': habit.id,
                'name': habit.name,
                'category': habit.category,
                'color': habit.color,
                **habit_streaks(habit),
            }
            for habit in habits
        ],
        key=lambda row: row['current'],
        reverse=True,
    )[:5]
    return {
        'total_habits': habits.count(),
        'active_habits': active_count,
        'completed_last_30_days': completions.count(),
        'completed_today': HabitCompletion.objects.filter(user=user, completed_on=today).count(),
        'completion_rate': round((completions.count() / max(active_count * 30, 1)) * 100, 2),
        'weekly_total': sum(row['count'] for row in weekly),
        'monthly_total': sum(row['count'] for row in monthly),
        'by_category': by_category,
        'weekly': weekly,
        'monthly': monthly,
        'top_streaks': top_streaks,
        'calendar': calendar,
        'xp': experience_summary(user),
    }


def mood_trends(user, period: str = 'weekly') -> list[dict]:
    trunc = TruncMonth('logged_on') if period == 'monthly' else TruncWeek('logged_on')
    trends = MoodEntry.objects.filter(user=user).annotate(period=trunc).values('period').annotate(avg_score=Avg('score'), entries=Count('id')).order_by('period')
    
    # Convert date to ISO format
    result = []
    for item in trends:
        try:
            period_str = item['period'].isoformat() if item['period'] else None
        except:
            period_str = str(item['period']) if item['period'] else None
        
        result.append({
            'period': period_str,
            'avg_score': round(float(item['avg_score'] or 0), 2),
            'entries': int(item['entries'] or 0),
        })
    return result


def mood_stats(user) -> dict:
    from datetime import date as date_class
    today = date_class.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    entries = MoodEntry.objects.filter(user=user)
    recent_entries = entries.order_by('-logged_on')[:8]
    aggregate = entries.aggregate(avg_score=Avg('score'), total=Count('id'))
    weekly_entries = entries.filter(logged_on__gte=week_start)
    monthly_entries = entries.filter(logged_on__gte=month_start)
    best_mood = entries.order_by('-score', '-logged_on').first()
    latest = entries.order_by('-logged_on').first()

    return {
        'total_entries': aggregate['total'] or 0,
        'average_score': round(aggregate['avg_score'] or 0, 2),
        'weekly_average': round(weekly_entries.aggregate(avg=Avg('score'))['avg'] or 0, 2),
        'monthly_average': round(monthly_entries.aggregate(avg=Avg('score'))['avg'] or 0, 2),
        'current_streak': calculate_streak(entries.values_list('logged_on', flat=True))['current'],
        'latest': {
            'mood': latest.mood,
            'emoji': latest.emoji,
            'label': latest.label,
            'score': latest.score,
            'logged_on': latest.logged_on.isoformat() if latest.logged_on else None,
        }
        if latest
        else None,
        'best_mood': {
            'mood': best_mood.mood,
            'emoji': best_mood.emoji,
            'label': best_mood.label,
            'score': best_mood.score,
            'logged_on': best_mood.logged_on.isoformat() if best_mood.logged_on else None,
        }
        if best_mood
        else None,
        'distribution': list(entries.values('mood', 'label', 'emoji').annotate(total=Count('id')).order_by('-total')),
        'weekly': [
            {
                'logged_on': item['logged_on'].isoformat() if item['logged_on'] else None,
                'avg_score': round(float(item['avg_score'] or 0), 2),
                'entries': int(item['entries'] or 0),
            }
            for item in weekly_entries.values('logged_on')
            .annotate(avg_score=Avg('score'), entries=Count('id'))
            .order_by('logged_on')
        ],
        'monthly': [
            {
                'logged_on': item['logged_on'].isoformat() if item['logged_on'] else None,
                'avg_score': round(float(item['avg_score'] or 0), 2),
                'entries': int(item['entries'] or 0),
            }
            for item in monthly_entries.values('logged_on')
            .annotate(avg_score=Avg('score'), entries=Count('id'))
            .order_by('logged_on')
        ],
        'recent_notes': [
            {
                'id': entry.id,
                'mood': entry.mood,
                'emoji': entry.emoji,
                'label': entry.label,
                'score': entry.score,
                'note': entry.note,
                'logged_on': entry.logged_on.isoformat() if entry.logged_on else None,
            }
            for entry in recent_entries
        ],
    }


def sleep_weekly(user) -> dict:
    start, end = date_range(7)
    entries = SleepEntry.objects.filter(user=user, slept_on__range=(start, end))
    aggregate = entries.aggregate(avg_minutes=Avg('duration_minutes'), avg_quality=Avg('quality'))
    return {
        'average_duration_minutes': round(aggregate['avg_minutes'] or 0, 2),
        'average_quality': round(aggregate['avg_quality'] or 0, 2),
        'entries': list(entries.values('slept_on', 'duration_minutes', 'quality').order_by('slept_on')),
    }


def sleep_trends(user, period: str = 'weekly') -> list[dict]:
    trunc = TruncMonth('slept_on') if period == 'monthly' else TruncWeek('slept_on')
    trends = SleepEntry.objects.filter(user=user).annotate(period=trunc).values('period').annotate(avg_minutes=Avg('duration_minutes'), avg_quality=Avg('quality'), entries=Count('id')).order_by('period')
    
    # Convert date to ISO format
    result = []
    for item in trends:
        try:
            period_str = item['period'].isoformat() if item['period'] else None
        except:
            period_str = str(item['period']) if item['period'] else None
        
        result.append({
            'period': period_str,
            'avg_minutes': round(float(item['avg_minutes'] or 0), 2),
            'avg_quality': round(float(item['avg_quality'] or 0), 2),
            'entries': int(item['entries'] or 0),
        })
    return result


def sleep_stats(user) -> dict:
    from datetime import date
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    entries = SleepEntry.objects.filter(user=user)
    week_entries = entries.filter(slept_on__gte=week_start)
    month_entries = entries.filter(slept_on__gte=month_start)
    latest = entries.order_by('-slept_on').first()
    best = entries.order_by('-quality', '-duration_minutes').first()

    # Serialize daily entries properly
    daily_entries = entries.order_by('slept_on')[:90]
    daily = [
        {
            'slept_on': e.slept_on.isoformat() if e.slept_on else None,
            'duration_minutes': e.duration_minutes,
            'quality': e.quality,
            'bedtime': e.bedtime.isoformat() if e.bedtime else None,
            'wake_time': e.wake_time.isoformat() if e.wake_time else None,
        }
        for e in daily_entries
    ]

    return {
        'total_entries': entries.count(),
        'weekly_average_minutes': round(week_entries.aggregate(avg=Avg('duration_minutes'))['avg'] or 0, 2),
        'monthly_average_minutes': round(month_entries.aggregate(avg=Avg('duration_minutes'))['avg'] or 0, 2),
        'weekly_average_quality': round(week_entries.aggregate(avg=Avg('quality'))['avg'] or 0, 2),
        'monthly_average_quality': round(month_entries.aggregate(avg=Avg('quality'))['avg'] or 0, 2),
        'current_streak': calculate_streak(entries.values_list('slept_on', flat=True))['current'],
        'latest': {
            'id': latest.id,
            'slept_on': latest.slept_on.isoformat() if latest.slept_on else None,
            'duration_minutes': latest.duration_minutes,
            'quality': latest.quality,
            'bedtime': latest.bedtime.isoformat() if latest.bedtime else None,
            'wake_time': latest.wake_time.isoformat() if latest.wake_time else None,
            'note': latest.note,
        }
        if latest
        else None,
        'best_sleep': {
            'id': best.id,
            'slept_on': best.slept_on.isoformat() if best.slept_on else None,
            'duration_minutes': best.duration_minutes,
            'quality': best.quality,
            'bedtime': best.bedtime.isoformat() if best.bedtime else None,
            'wake_time': best.wake_time.isoformat() if best.wake_time else None,
            'note': best.note,
        }
        if best
        else None,
        'daily': daily,
        'weekly': sleep_trends(user, 'weekly'),
        'monthly': sleep_trends(user, 'monthly'),
    }


def sleep_report(user, period: str = 'weekly') -> dict:
    days = 30 if period == 'monthly' else 7
    start, end = date_range(days)
    entries = SleepEntry.objects.filter(user=user, slept_on__range=(start, end))
    aggregate = entries.aggregate(avg_minutes=Avg('duration_minutes'), avg_quality=Avg('quality'), total=Count('id'))
    
    # Serialize nights properly
    nights_entries = entries.order_by('slept_on')
    nights = [
        {
            'id': e.id,
            'slept_on': e.slept_on.isoformat() if e.slept_on else None,
            'duration_minutes': e.duration_minutes,
            'quality': e.quality,
            'bedtime': e.bedtime.isoformat() if e.bedtime else None,
            'wake_time': e.wake_time.isoformat() if e.wake_time else None,
            'note': e.note,
        }
        for e in nights_entries
    ]
    
    return {
        'period': period,
        'start': start.isoformat() if start else None,
        'end': end.isoformat() if end else None,
        'entries': aggregate['total'] or 0,
        'average_duration_minutes': round(aggregate['avg_minutes'] or 0, 2),
        'average_quality': round(aggregate['avg_quality'] or 0, 2),
        'nights': nights,
    }


def focus_stats(user) -> dict:
    from django.core.serializers.json import DjangoJSONEncoder
    from datetime import date as date_class
    import json
    
    today = date_class.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    sessions = FocusSession.objects.filter(user=user)
    completed = sessions.filter(completed=True)
    today_completed = completed.filter(started_at__date=today)
    week_completed = completed.filter(started_at__date__gte=week_start)
    month_completed = completed.filter(started_at__date__gte=month_start)
    session_dates = completed.annotate(day=TruncDate('started_at')).values_list('day', flat=True)
    
    # Get recent sessions with proper datetime serialization
    recent_sessions = sessions.order_by('-started_at')[:10]
    recent = [
        {
            'id': s.id,
            'subject': s.subject,
            'session_type': s.session_type,
            'started_at': s.started_at.isoformat() if s.started_at else None,
            'ended_at': s.ended_at.isoformat() if s.ended_at else None,
            'duration_minutes': s.duration_minutes,
            'completed': s.completed,
            'productivity_rating': s.productivity_rating,
            'notes': s.notes,
        }
        for s in recent_sessions
    ]
    
    # Get daily stats with proper date serialization
    daily_stats = completed.annotate(day=TruncDate('started_at')).values('day').annotate(minutes=Sum('duration_minutes'), sessions=Count('id'), avg_productivity=Avg('productivity_rating')).order_by('day')
    daily = [
        {
            'day': item['day'].isoformat() if item['day'] else None,
            'minutes': item['minutes'] or 0,
            'sessions': item['sessions'] or 0,
            'avg_productivity': round(item['avg_productivity'] or 0, 2),
        }
        for item in daily_stats
    ]
    
    return {
        'total_sessions': sessions.count(),
        'completed_sessions': completed.count(),
        'today_minutes': today_completed.aggregate(total=Sum('duration_minutes'))['total'] or 0,
        'weekly_minutes': week_completed.aggregate(total=Sum('duration_minutes'))['total'] or 0,
        'monthly_minutes': month_completed.aggregate(total=Sum('duration_minutes'))['total'] or 0,
        'total_minutes': completed.aggregate(total=Sum('duration_minutes'))['total'] or 0,
        'average_productivity': round(completed.aggregate(avg=Avg('productivity_rating'))['avg'] or 0, 2),
        'current_streak': calculate_streak(session_dates)['current'],
        'by_subject': list(
            completed.values('subject')
            .annotate(minutes=Sum('duration_minutes'), sessions=Count('id'))
            .order_by('-minutes')
        ),
        'by_type': list(
            completed.values('session_type')
            .annotate(minutes=Sum('duration_minutes'), sessions=Count('id'))
            .order_by('-minutes')
        ),
        'daily': daily,
        'recent': recent,
    }


def focus_trends(user, period: str = 'weekly') -> list[dict]:
    trunc = TruncMonth('started_at') if period == 'monthly' else TruncWeek('started_at')
    trends = FocusSession.objects.filter(user=user, completed=True).annotate(period=trunc).values('period').annotate(minutes=Sum('duration_minutes'), sessions=Count('id'), avg_productivity=Avg('productivity_rating')).order_by('period')
    
    # Convert datetime to ISO format for JSON serialization
    result = []
    for item in trends:
        try:
            period_str = item['period'].isoformat() if item['period'] else None
        except:
            period_str = str(item['period']) if item['period'] else None
        
        result.append({
            'period': period_str,
            'minutes': int(item['minutes'] or 0),
            'sessions': int(item['sessions'] or 0),
            'avg_productivity': round(float(item['avg_productivity'] or 0), 2),
        })
    return result


def expense_monthly(user) -> dict:
    from datetime import date as date_class
    today = date_class.today()
    start = today.replace(day=1)
    entries = ExpenseEntry.objects.filter(user=user, occurred_on__gte=start).select_related('category')
    income = entries.filter(entry_type=ExpenseEntry.EntryType.INCOME).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    expenses = entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    by_category = []
    for cat_data in entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE).values('category__id', 'category__name', 'category__monthly_budget', 'category__color', 'category__icon').annotate(total=Sum('amount')).order_by('-total'):
        total_amount = float(cat_data['total'] or 0)
        expenses_float = float(expenses or 0)
        by_category.append({
            'category_id': cat_data['category__id'],
            'category_name': cat_data['category__name'],
            'budget': float(cat_data['category__monthly_budget'] or 0),
            'total': total_amount,
            'color': cat_data['category__color'],
            'icon': cat_data['category__icon'],
            'percentage': round((total_amount / expenses_float) * 100, 2) if expenses_float > 0 else 0,
        })
    
    income_float = float(income)
    expenses_float = float(expenses)
    net = income_float - expenses_float
    savings_rate = round((net / income_float) * 100, 2) if income_float > 0 else 0
    
    return {
        'month': start.isoformat(),
        'income': income_float,
        'expense': expenses_float,
        'expenses': expenses_float,
        'net': net,
        'savings_rate': savings_rate,
        'by_category': by_category,
    }


def expense_trends(user) -> list[dict]:
    trends = ExpenseEntry.objects.filter(user=user).annotate(month=TruncMonth('occurred_on')).values('month', 'entry_type').annotate(total=Sum('amount')).order_by('month')
    
    result = []
    for item in trends:
        result.append({
            'month': item['month'].isoformat() if item['month'] else None,
            'entry_type': item['entry_type'],
            'total': float(item['total'] or 0),
        })
    return result


def expense_analytics(user) -> dict:
    try:
        from datetime import date as date_class
        today = date_class.today()
        month_start = today.replace(day=1)
        year_start = today.replace(month=1, day=1)
        
        all_entries = ExpenseEntry.objects.filter(user=user)
        month_entries = all_entries.filter(occurred_on__gte=month_start)
        year_entries = all_entries.filter(occurred_on__gte=year_start)
        
        # Monthly stats
        monthly_income = month_entries.filter(entry_type=ExpenseEntry.EntryType.INCOME).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        monthly_expense = month_entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # Yearly stats
        yearly_income = year_entries.filter(entry_type=ExpenseEntry.EntryType.INCOME).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        yearly_expense = year_entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # By payment method (expenses only)
        by_payment = list(
            month_entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE)
            .values('payment_method')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        
        # Top spending categories (both income and expense)
        top_categories = list(
            month_entries
            .values('category__name', 'category__icon', 'category__color')
            .annotate(total=Sum('amount'))
            .order_by('-total')[:5]
        )
        
        # Recent transactions
        recent = all_entries.order_by('-occurred_on', '-created_at')[:10]
        recent_list = [
            {
                'id': e.id,
                'category_name': e.category.name,
                'entry_type': e.entry_type,
                'amount': float(e.amount),
                'occurred_on': e.occurred_on.isoformat(),
                'description': e.description,
            }
            for e in recent
        ]
        
        return {
            'monthly': {
                'income': float(monthly_income),
                'expense': float(monthly_expense),
                'net': float(monthly_income - monthly_expense),
                'savings_rate': round((float(monthly_income - monthly_expense) / float(monthly_income)) * 100, 2) if monthly_income else 0,
            },
            'yearly': {
                'income': float(yearly_income),
                'expense': float(yearly_expense),
                'net': float(yearly_income - yearly_expense),
                'savings_rate': round((float(yearly_income - yearly_expense) / float(yearly_income)) * 100, 2) if yearly_income else 0,
            },
            'by_payment': [{'payment_method': item['payment_method'], 'total': float(item['total'] or 0)} for item in by_payment],
            'top_categories': [
                {
                    'name': item['category__name'],
                    'icon': item['category__icon'],
                    'color': item['category__color'],
                    'total': float(item['total'] or 0),
                }
                for item in top_categories
            ],
            'recent': recent_list,
        }
    except Exception as e:
        return {
            'monthly': {'income': 0, 'expense': 0, 'net': 0, 'savings_rate': 0},
            'yearly': {'income': 0, 'expense': 0, 'net': 0, 'savings_rate': 0},
            'by_payment': [],
            'top_categories': [],
            'recent': [],
            'error': str(e),
        }


def update_goal_progress(goal: Goal) -> Goal:
    """Update goal progress without changing status on creation"""
    milestone_count = goal.milestones.count()
    if milestone_count:
        completed = goal.milestones.filter(completed=True).count()
        goal.progress_percent = min(100, round((completed / milestone_count) * 100))
    else:
        current = float(goal.current_value)
        target = float(goal.target_value) if goal.target_value else 1
        goal.progress_percent = min(100, round((current / max(target, 1)) * 100))
    
    goal.save(update_fields=['progress_percent', 'updated_at'])
    return goal


def goals_stats(user) -> dict:
    try:
        from datetime import date as datetime_date
        
        goals = Goal.objects.filter(user=user).prefetch_related('milestones')
        
        # Calculate progress without saving
        goal_progress_map = {}
        for goal in goals:
            milestone_count = goal.milestones.count()
            if milestone_count:
                completed = goal.milestones.filter(completed=True).count()
                progress = min(100, round((completed / milestone_count) * 100))
            else:
                current = float(goal.current_value)
                target = float(goal.target_value) if goal.target_value else 1
                progress = min(100, round((current / max(target, 1)) * 100))
            goal_progress_map[goal.id] = progress
        
        today = datetime_date.today()
        
        # Status breakdown
        by_status = {
            'not_started': goals.filter(status=Goal.Status.NOT_STARTED).count(),
            'in_progress': goals.filter(status=Goal.Status.IN_PROGRESS).count(),
            'completed': goals.filter(status=Goal.Status.COMPLETED).count(),
            'paused': goals.filter(status=Goal.Status.PAUSED).count(),
            'archived': goals.filter(status=Goal.Status.ARCHIVED).count(),
        }
        
        # Priority breakdown
        by_priority = {
            'low': goals.filter(priority=Goal.Priority.LOW).count(),
            'medium': goals.filter(priority=Goal.Priority.MEDIUM).count(),
            'high': goals.filter(priority=Goal.Priority.HIGH).count(),
            'critical': goals.filter(priority=Goal.Priority.CRITICAL).count(),
        }
        
        # Category breakdown
        by_category = list(goals.values('category').annotate(total=Count('id')).order_by('category'))
        
        # Upcoming deadlines
        upcoming = goals.filter(deadline__isnull=False, deadline__gte=today, status__in=[Goal.Status.NOT_STARTED, Goal.Status.IN_PROGRESS]).order_by('deadline')[:5]
        upcoming_deadlines = [
            {
                'id': g.id,
                'title': g.title,
                'deadline': g.deadline.isoformat() if g.deadline else None,
                'days_remaining': (g.deadline - today).days if g.deadline else None,
                'priority': g.priority,
                'progress_percent': goal_progress_map.get(g.id, 0),
            }
            for g in upcoming
        ]
        
        # Overdue goals
        overdue = goals.filter(deadline__isnull=False, deadline__lt=today, status__in=[Goal.Status.NOT_STARTED, Goal.Status.IN_PROGRESS]).count()
        
        # Completion rate
        active_goals = goals.filter(status__in=[Goal.Status.NOT_STARTED, Goal.Status.IN_PROGRESS, Goal.Status.COMPLETED])
        completion_rate = round((by_status['completed'] / max(active_goals.count(), 1)) * 100, 2)
        
        # Milestones
        total_milestones = Milestone.objects.filter(user=user).count()
        completed_milestones = Milestone.objects.filter(user=user, completed=True).count()
        
        # Calculate average progress from calculated values
        average_progress = round(sum(goal_progress_map.values()) / max(len(goal_progress_map), 1), 2) if goal_progress_map else 0
        
        return {
            'total': goals.count(),
            'by_status': by_status,
            'by_priority': by_priority,
            'by_category': by_category,
            'average_progress': average_progress,
            'completion_rate': completion_rate,
            'upcoming_deadlines': upcoming_deadlines,
            'overdue_count': overdue,
            'total_milestones': total_milestones,
            'completed_milestones': completed_milestones,
        }
    except Exception as e:
        return {
            'total': 0,
            'by_status': {'not_started': 0, 'in_progress': 0, 'completed': 0, 'paused': 0, 'archived': 0},
            'by_priority': {'low': 0, 'medium': 0, 'high': 0, 'critical': 0},
            'by_category': [],
            'average_progress': 0,
            'completion_rate': 0,
            'upcoming_deadlines': [],
            'overdue_count': 0,
            'total_milestones': 0,
            'completed_milestones': 0,
            'error': str(e),
        }


def reading_stats(user) -> dict:
    logs = ReadingLog.objects.filter(user=user)
    streaks = calculate_streak(logs.values_list('read_on', flat=True))
    return {
        'books': Book.objects.filter(user=user).count(),
        'pages_read': logs.aggregate(total=Sum('pages_read'))['total'] or 0,
        'current_streak': streaks['current'],
        'longest_streak': streaks['longest'],
        'daily': list(logs.values('read_on').annotate(pages=Sum('pages_read')).order_by('read_on')),
    }


def journal_stats(user) -> dict:
    try:
        entries = JournalEntry.objects.filter(user=user)
        tag_counts: dict[str, int] = defaultdict(int)
        
        for tags in entries.values_list('tags', flat=True):
            for tag in tags or []:
                tag_counts[str(tag)] += 1
        
        # Sort tags by count
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Recent entries
        recent = entries.order_by('-entry_date', '-created_at')[:5]
        recent_list = [
            {
                'id': e.id,
                'title': e.title,
                'entry_date': e.entry_date.isoformat(),
                'word_count': e.word_count,
                'is_pinned': e.is_pinned,
                'is_favorite': e.is_favorite,
                'tags': e.tags,
            }
            for e in recent
        ]
        
        # Word count stats
        total_words = entries.aggregate(total=Sum('word_count'))['total'] or 0
        avg_words = round(entries.aggregate(avg=Avg('word_count'))['avg'] or 0, 2)
        
        # Mood stats if mood tracking is used
        mood_distribution = list(
            entries.exclude(mood='')
            .values('mood')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        return {
            'entries': entries.count(),
            'pinned': entries.filter(is_pinned=True).count(),
            'favorites': entries.filter(is_favorite=True).count(),
            'current_streak': calculate_streak(entries.values_list('entry_date', flat=True))['current'],
            'total_words': total_words,
            'average_words': avg_words,
            'top_tags': [{'tag': tag, 'count': count} for tag, count in top_tags],
            'recent': recent_list,
            'mood_distribution': mood_distribution,
        }
    except Exception as e:
        return {
            'entries': 0,
            'pinned': 0,
            'favorites': 0,
            'current_streak': 0,
            'total_words': 0,
            'average_words': 0,
            'top_tags': [],
            'recent': [],
            'mood_distribution': [],
            'error': str(e),
        }


def dashboard_data(user) -> dict:
    try:
        return {
            'habits': habit_stats(user),
            'experience': experience_summary(user),
            'mood': {'trends': mood_trends(user)},
            'sleep': sleep_weekly(user),
            'focus': focus_stats(user),
            'expenses': expense_monthly(user),
            'goals': goals_stats(user),
            'reading': reading_stats(user),
            'journal': journal_stats(user),
        }
    except Exception as e:
        # Return minimal data on error
        return {
            'habits': {'total_habits': 0, 'active_habits': 0},
            'experience': {'total_xp': 0, 'level': 1},
            'mood': {'trends': []},
            'sleep': {'average_duration_minutes': 0, 'average_quality': 0, 'entries': []},
            'focus': {'total_sessions': 0, 'completed_sessions': 0},
            'expenses': {'month': '', 'income': 0, 'expenses': 0},
            'goals': {'total': 0, 'by_status': {}},
            'reading': {'books': 0, 'pages_read': 0},
            'journal': {'entries': 0},
            'error': str(e),
        }
