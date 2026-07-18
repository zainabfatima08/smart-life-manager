from datetime import date, timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Avg, Count, Q
from apps.trackers.models import (
    Habit, HabitCompletion, MoodEntry, SleepEntry, FocusSession,
    ExpenseEntry, Goal, Book, ReadingLog, JournalEntry
)


def get_today_summary(user):
    """Get today's quick summary for dashboard"""
    today = timezone.localtime().date()
    
    habits_completed = HabitCompletion.objects.filter(
        user=user, completed_on=today
    ).count()
    
    habits_total = Habit.objects.filter(
        user=user, is_active=True
    ).count()
    
    latest_mood = MoodEntry.objects.filter(
        user=user, logged_on=today
    ).order_by('-created_at').first()
    
    sleep_entry = SleepEntry.objects.filter(
        user=user, slept_on=today
    ).first()
    
    focus_minutes = FocusSession.objects.filter(
        user=user, completed=True, started_at__date=today
    ).aggregate(total=Sum('duration_minutes'))['total'] or 0
    
    expenses_today = ExpenseEntry.objects.filter(
        user=user, occurred_on=today, entry_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    active_goals = Goal.objects.filter(
        user=user, status__in=['not_started', 'in_progress']
    ).count()
    
    journal_entries = JournalEntry.objects.filter(
        user=user, entry_date=today
    ).count()
    
    return {
        'habits_completed': habits_completed,
        'habits_total': habits_total,
        'current_mood': latest_mood.mood if latest_mood else None,
        'sleep_hours': float(sleep_entry.duration_minutes / 60) if sleep_entry else 0,
        'focus_minutes': focus_minutes,
        'expenses_today': float(expenses_today),
        'active_goals': active_goals,
        'journal_entries': journal_entries,
    }


def calculate_life_score(user):
    """Calculate overall life score (0-100) based on all trackers"""
    today = timezone.localtime().date()
    week_start = today - timedelta(days=today.weekday())
    
    # Productivity Score (habits + focus)
    habits = Habit.objects.filter(user=user, is_active=True)
    habit_target = habits.aggregate(target=Sum('target_per_week'))['target'] or 0
    habit_completed = HabitCompletion.objects.filter(
        user=user, completed_on__gte=week_start
    ).count()
    productivity_score = min(100, int((habit_completed / max(habit_target, 1)) * 100))
    
    # Wellness Score (mood + sleep)
    moods = MoodEntry.objects.filter(user=user, logged_on__gte=week_start)
    avg_mood = moods.aggregate(avg=Avg('score'))['avg'] or 0
    mood_score = int((float(avg_mood) / 10) * 100)
    
    sleep_entries = SleepEntry.objects.filter(user=user, slept_on__gte=week_start)
    avg_sleep = sleep_entries.aggregate(avg=Avg('duration_minutes'))['avg'] or 0
    sleep_score = min(100, int((float(avg_sleep) / 480) * 100))  # 8 hours target
    wellness_score = (mood_score + sleep_score) // 2
    
    # Finance Score
    month_start = today.replace(day=1)
    income = ExpenseEntry.objects.filter(
        user=user, occurred_on__gte=month_start, entry_type='income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    expenses = ExpenseEntry.objects.filter(
        user=user, occurred_on__gte=month_start, entry_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    savings = float(income) - float(expenses)
    income_float = float(income)
    finance_score = 50 if income_float == 0 else min(100, int((savings / max(income_float, 1)) * 100) + 50)
    
    # Growth Score (goals + reading + journal)
    goals_completed = Goal.objects.filter(
        user=user, status='completed'
    ).count()
    total_goals = Goal.objects.filter(user=user).count()
    goal_score = int((goals_completed / max(total_goals, 1)) * 100) if total_goals > 0 else 0
    
    reading_logs = ReadingLog.objects.filter(user=user, read_on__gte=week_start).count()
    reading_score = min(100, int(reading_logs * 10))
    
    journal_entries = JournalEntry.objects.filter(
        user=user, entry_date__gte=week_start
    ).count()
    journal_score = min(100, int(journal_entries * 15))
    
    growth_score = (goal_score + reading_score + journal_score) // 3
    
    # Overall Score
    overall_score = (productivity_score + wellness_score + finance_score + growth_score) // 4
    
    # Determine trend
    last_week_start = week_start - timedelta(days=7)
    last_week_habits = HabitCompletion.objects.filter(
        user=user, completed_on__gte=last_week_start, completed_on__lt=week_start
    ).count()
    
    trend = 'up' if habit_completed > last_week_habits else ('down' if habit_completed < last_week_habits else 'stable')
    
    return {
        'overall_score': overall_score,
        'productivity_score': productivity_score,
        'wellness_score': wellness_score,
        'finance_score': finance_score,
        'growth_score': growth_score,
        'trend': trend,
    }


def get_activity_timeline(user, days=7, activity_type='all', page=1, page_size=10):
    """Get activity timeline from all trackers with pagination and filtering"""
    today = timezone.localtime().date()
    start_date = today - timedelta(days=days)
    activities = []
    
    # Habits
    if activity_type in ['all', 'habit']:
        habit_completions = HabitCompletion.objects.filter(
            user=user, completed_on__gte=start_date
        ).select_related('habit').order_by('-completed_on')
        
        for completion in habit_completions:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(completion.completed_on, timezone.datetime.min.time())),
                'activity_type': 'habit',
                'title': f'Completed: {completion.habit.name}',
                'description': completion.note or '',
                'icon': completion.habit.icon or 'Check',
                'color': completion.habit.color or 'blue',
            })
    
    # Moods
    if activity_type in ['all', 'mood']:
        moods = MoodEntry.objects.filter(
            user=user, logged_on__gte=start_date
        ).order_by('-logged_on')
        
        for mood in moods:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(mood.logged_on, timezone.datetime.min.time())),
                'activity_type': 'mood',
                'title': f'Mood: {mood.label}',
                'description': mood.note or '',
                'icon': 'Smile',
                'color': 'purple',
            })
    
    # Focus Sessions
    if activity_type in ['all', 'focus']:
        focus_sessions = FocusSession.objects.filter(
            user=user, started_at__date__gte=start_date, completed=True
        ).order_by('-started_at')
        
        for session in focus_sessions:
            activities.append({
                'timestamp': session.started_at,
                'activity_type': 'focus',
                'title': f'Focus: {session.subject}',
                'description': f'{session.duration_minutes}m - {session.session_type.replace("_", " ").title()}',
                'icon': 'Zap',
                'color': 'green',
            })
    
    # Goals
    if activity_type in ['all', 'goal']:
        goals = Goal.objects.filter(
            user=user, updated_at__date__gte=start_date
        ).order_by('-updated_at')[:5]
        
        for goal in goals:
            activities.append({
                'timestamp': goal.updated_at,
                'activity_type': 'goal',
                'title': f'Goal: {goal.title}',
                'description': f'{goal.progress_percent}% complete',
                'icon': 'Target',
                'color': 'blue',
            })
    
    # Journal
    if activity_type in ['all', 'journal']:
        journals = JournalEntry.objects.filter(
            user=user, entry_date__gte=start_date
        ).order_by('-entry_date')
        
        for journal in journals:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(journal.entry_date, timezone.datetime.min.time())),
                'activity_type': 'journal',
                'title': journal.title or 'Journal Entry',
                'description': journal.content[:100] + '...' if len(journal.content) > 100 else journal.content,
                'icon': 'BookOpen',
                'color': 'amber',
            })
    
    # Reading
    if activity_type in ['all', 'reading']:
        reading_logs = ReadingLog.objects.filter(
            user=user, read_on__gte=start_date
        ).select_related('book').order_by('-read_on')
        
        for log in reading_logs:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(log.read_on, timezone.datetime.min.time())),
                'activity_type': 'reading',
                'title': f'Reading: {log.book.title}',
                'description': f'{log.pages_read} pages',
                'icon': 'BookMarked',
                'color': 'orange',
            })
    
    # Sleep
    if activity_type in ['all', 'sleep']:
        sleep_entries = SleepEntry.objects.filter(
            user=user, slept_on__gte=start_date
        ).order_by('-slept_on')
        
        for entry in sleep_entries:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(entry.slept_on, timezone.datetime.min.time())),
                'activity_type': 'sleep',
                'title': f'Sleep: {entry.duration_minutes}m',
                'description': f'Quality: {entry.quality}/10',
                'icon': 'Moon',
                'color': 'blue',
            })
    
    # Expenses
    if activity_type in ['all', 'expense']:
        expenses = ExpenseEntry.objects.filter(
            user=user, occurred_on__gte=start_date
        ).select_related('category').order_by('-occurred_on')[:20]
        
        for expense in expenses:
            activities.append({
                'timestamp': timezone.make_aware(timezone.datetime.combine(expense.occurred_on, timezone.datetime.min.time())),
                'activity_type': 'expense',
                'title': f'{expense.entry_type.title()}: {expense.category.name}',
                'description': f'{expense.category.icon} {expense.amount}',
                'icon': 'Wallet',
                'color': 'red' if expense.entry_type == 'expense' else 'green',
            })
    
    # Sort by timestamp descending
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Apply pagination
    total_count = len(activities)
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_activities = activities[start_idx:end_idx]
    
    # Calculate pagination info
    total_pages = (total_count + page_size - 1) // page_size
    has_next = page < total_pages
    has_previous = page > 1
    
    return {
        'count': total_count,
        'next': has_next,
        'previous': has_previous,
        'page': page,
        'page_size': page_size,
        'total_pages': total_pages,
        'results': paginated_activities,
    }


def generate_insights(user):
    """Generate dynamic insights from tracker data"""
    today = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())
    last_week_start = week_start - timedelta(days=7)
    insights = []
    
    # Sleep insight
    this_week_sleep = SleepEntry.objects.filter(
        user=user, slept_on__gte=week_start
    ).aggregate(avg=Avg('duration_minutes'))['avg'] or 0
    
    last_week_sleep = SleepEntry.objects.filter(
        user=user, slept_on__gte=last_week_start, slept_on__lt=week_start
    ).aggregate(avg=Avg('duration_minutes'))['avg'] or 0
    
    if this_week_sleep > last_week_sleep + 60:  # 1 hour improvement
        insights.append({
            'title': 'Sleep Improved',
            'description': f'Your sleep improved by {int((this_week_sleep - last_week_sleep) / 60)} hour this week!',
            'icon': 'Moon',
            'type': 'positive',
            'value': f'+{int((this_week_sleep - last_week_sleep) / 60)}h',
        })
    
    # Productivity insight
    this_week_habits = HabitCompletion.objects.filter(
        user=user, completed_on__gte=week_start
    ).count()
    last_week_habits = HabitCompletion.objects.filter(
        user=user, completed_on__gte=last_week_start, completed_on__lt=week_start
    ).count()
    
    if last_week_habits > 0:
        productivity_change = int(((this_week_habits - last_week_habits) / last_week_habits) * 100)
        if productivity_change > 10:
            insights.append({
                'title': 'Productivity Surge',
                'description': f'Your productivity increased by {productivity_change}% this week!',
                'icon': 'TrendingUp',
                'type': 'positive',
                'value': f'+{productivity_change}%',
            })
    
    # Budget insight
    month_start = today.replace(day=1)
    income = ExpenseEntry.objects.filter(
        user=user, occurred_on__gte=month_start, entry_type='income'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    expenses = ExpenseEntry.objects.filter(
        user=user, occurred_on__gte=month_start, entry_type='expense'
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
    
    if float(expenses) < float(income) * 0.7:
        insights.append({
            'title': 'Budget On Track',
            'description': 'Your spending is below your monthly budget. Keep it up!',
            'icon': 'Wallet',
            'type': 'positive',
            'value': '',
        })
    
    # Reading streak
    reading_logs = ReadingLog.objects.filter(
        user=user, read_on__gte=week_start
    ).values('read_on').distinct().count()
    
    if reading_logs >= 3:
        insights.append({
            'title': 'Reading Consistency',
            'description': f'You have been reading {reading_logs} days this week. Amazing!',
            'icon': 'BookOpen',
            'type': 'positive',
            'value': f'{reading_logs}d',
        })
    
    # Goal progress
    goals_in_progress = Goal.objects.filter(
        user=user, status='in_progress', progress_percent__gte=75
    )
    
    for goal in goals_in_progress[:1]:
        insights.append({
            'title': 'Goal Close to Completion',
            'description': f'You are {100 - goal.progress_percent}% away from completing "{goal.title}"',
            'icon': 'Target',
            'type': 'positive',
            'value': f'{goal.progress_percent}%',
        })
    
    # Journal prompt
    today_journal = JournalEntry.objects.filter(
        user=user, entry_date=today
    ).count()
    
    if today_journal == 0:
        insights.append({
            'title': 'Reflect Today',
            'description': 'Haven\'t journaled today? Take a moment to reflect on your day.',
            'icon': 'PenTool',
            'type': 'neutral',
            'value': '',
        })
    
    return insights[:4]  # Return top 4 insights
