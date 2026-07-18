from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.db.models import Count
from .models import Profile, Achievement, Milestone, AccountActivity

User = get_user_model()

@receiver(post_save, sender=User)
def ensure_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance, display_name=instance.get_full_name() or instance.username)

@receiver(post_save, sender=User)
def track_user_login(sender, instance, **kwargs):
    """Track user login activity"""
    pass

@receiver(post_save, sender=Profile)
def check_profile_milestones(sender, instance, created, **kwargs):
    if created:
        # Create initial milestone
        Milestone.objects.create(
            user=instance.user,
            title='Welcome to Life OS',
            description='Your journey begins here',
            milestone_type='profile_created',
            icon_name='🎯',
            metadata={'profile_completion': 0}
        )

def check_habit_milestones(user):
    from apps.trackers.models import Habit, HabitCompletion
    from datetime import timedelta
    
    today = timezone.now().date()

    habit_count = Habit.objects.filter(user=user, is_active=True).count()
    
    milestones_data = {
        'first_habit': {'count': 1, 'title': 'Your First Habit', 'description': 'Created your first habit'},
        'five_habits': {'count': 5, 'title': 'Habit Master', 'description': 'Created 5 active habits'},
        'ten_habits': {'count': 10, 'title': 'Habit Legend', 'description': 'Created 10 active habits'},
    }
    
    for key, data in milestones_data.items():
        if habit_count >= data['count']:
            if not Milestone.objects.filter(user=user, milestone_type=key).exists():
                Milestone.objects.create(
                    user=user,
                    title=data['title'],
                    description=data['description'],
                    milestone_type=key,
                    icon_name='🔥',
                    metadata={'habit_count': habit_count}
                )
    
    # Check for streak milestones
    completions = list(HabitCompletion.objects.filter(
        user=user
    ).order_by('completed_on').values_list('completed_on', flat=True))
    
    if completions:
        # Calculate current streak
        current_streak = 0
        expected_date = today
        
        for completion_date in sorted(completions, reverse=True)[:30]:
            if completion_date == expected_date:
                current_streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
        
        # Create streak milestones
        streak_milestones = {
            'streak_7': 7,
            'streak_30': 30,
            'streak_100': 100,
        }
        
        for key, days in streak_milestones.items():
            if current_streak >= days:
                if not Milestone.objects.filter(user=user, milestone_type=key).exists():
                    Milestone.objects.create(
                        user=user,
                        title=f'{days} Day Streak',
                        description=f'Maintained a {days} day habit streak',
                        milestone_type=key,
                        icon_name='🔥',
                        metadata={'streak_days': current_streak}
                    )

def check_reading_milestones(user):
    """Check and unlock reading-related milestones"""
    from apps.trackers.models import Book, ReadingLog
    
    books_completed = Book.objects.filter(user=user, finished_on__isnull=False).count()
    total_pages = ReadingLog.objects.filter(user=user).aggregate(
        total=__import__('django.db.models', fromlist=['Sum']).Sum('pages_read')
    )['total'] or 0
    
    reading_milestones = {
        'first_book': {'count': 1, 'title': 'Bookworm', 'description': 'Completed your first book'},
        'five_books': {'count': 5, 'title': 'Reading Enthusiast', 'description': 'Completed 5 books'},
        'thousand_pages': {'pages': 1000, 'title': 'Page Turner', 'description': 'Read 1000 pages'},
    }
    
    for key, data in reading_milestones.items():
        milestone_type = key
        should_create = False
        metadata = {}
        
        if 'count' in data:
            should_create = books_completed >= data['count']
            metadata['books_completed'] = books_completed
        elif 'pages' in data:
            should_create = total_pages >= data['pages']
            metadata['total_pages'] = total_pages
        
        if should_create and not Milestone.objects.filter(user=user, milestone_type=key).exists():
            Milestone.objects.create(
                user=user,
                title=data['title'],
                description=data['description'],
                milestone_type=milestone_type,
                icon_name='📚',
                metadata=metadata
            )

def check_goal_milestones(user):
    """Check and unlock goal-related milestones"""
    from apps.trackers.models import Goal
    
    goals_completed = Goal.objects.filter(user=user, status='completed').count()
    
    goal_milestones = {
        'first_goal': {'count': 1, 'title': 'Goal Setter', 'description': 'Completed your first goal'},
        'five_goals': {'count': 5, 'title': 'Goal Getter', 'description': 'Completed 5 goals'},
        'ten_goals': {'count': 10, 'title': 'Goal Master', 'description': 'Completed 10 goals'},
    }
    
    for key, data in goal_milestones.items():
        if goals_completed >= data['count']:
            if not Milestone.objects.filter(user=user, milestone_type=key).exists():
                Milestone.objects.create(
                    user=user,
                    title=data['title'],
                    description=data['description'],
                    milestone_type=key,
                    icon_name='🎯',
                    metadata={'goals_completed': goals_completed}
                )

def unlock_achievements(user):
    """Check and unlock achievements for user"""
    from apps.trackers.models import Habit, Book, Goal, MoodEntry, JournalEntry
    
    # Get all user achievements
    achievements = Achievement.objects.filter(user=user)
    
    for achievement in achievements:
        if achievement.is_unlocked:
            continue
        
        condition = achievement.unlock_condition
        should_unlock = False
        
        if achievement.achievement_type == 'habit':
            if condition.get('type') == 'first_habit':
                should_unlock = Habit.objects.filter(user=user).exists()
            elif condition.get('type') == 'habits_count':
                count = Habit.objects.filter(user=user, is_active=True).count()
                should_unlock = count >= condition.get('value', 0)
        
        elif achievement.achievement_type == 'reading':
            if condition.get('type') == 'first_book':
                should_unlock = Book.objects.filter(user=user, finished_on__isnull=False).exists()
            elif condition.get('type') == 'books_completed':
                count = Book.objects.filter(user=user, finished_on__isnull=False).count()
                should_unlock = count >= condition.get('value', 0)
        
        elif achievement.achievement_type == 'goal':
            if condition.get('type') == 'first_goal':
                should_unlock = Goal.objects.filter(user=user, status='completed').exists()
            elif condition.get('type') == 'goals_completed':
                count = Goal.objects.filter(user=user, status='completed').count()
                should_unlock = count >= condition.get('value', 0)
        
        elif achievement.achievement_type == 'journal':
            if condition.get('type') == 'journal_entries':
                count = JournalEntry.objects.filter(user=user).count()
                should_unlock = count >= condition.get('value', 0)
        
        if should_unlock:
            achievement.is_unlocked = True
            achievement.unlocked_at = timezone.now()
            achievement.save()

def record_activity(user, activity_type, description, ip_address=None, user_agent=None, device_name=None):
    """Record user account activity"""
    AccountActivity.objects.create(
        user=user,
        activity_type=activity_type,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
        device_name=device_name or 'Unknown Device'
    )

# Signal for tracking habit completions and checking milestones
@receiver(post_save, sender='trackers.HabitCompletion')
def on_habit_completion(sender, instance, created, **kwargs):
    """Trigger milestone checks when habit is completed"""
    if created:
        # Check for habit milestones
        check_habit_milestones(instance.user)
        # Check for achievements
        unlock_achievements(instance.user)

# Signal for tracking book completions
@receiver(post_save, sender='trackers.Book')
def on_book_update(sender, instance, created, **kwargs):
    """Trigger milestones when book is completed"""
    if instance.finished_on:
        check_reading_milestones(instance.user)
        unlock_achievements(instance.user)

# Signal for tracking goal completions
@receiver(post_save, sender='trackers.Goal')
def on_goal_update(sender, instance, created, **kwargs):
    """Trigger milestones when goal is completed"""
    if instance.status == 'completed':
        check_goal_milestones(instance.user)
        unlock_achievements(instance.user)