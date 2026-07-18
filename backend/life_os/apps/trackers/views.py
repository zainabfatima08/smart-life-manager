from __future__ import annotations

# File updated to ensure serializers reload

from django.db.models import QuerySet
from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    Book,
    ExpenseCategory,
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
from .selectors import apply_date_filters, apply_search
from .serializers import (
    BookSerializer,
    ExpenseCategorySerializer,
    ExpenseEntrySerializer,
    FocusSessionSerializer,
    GoalSerializer,
    HabitCompletionSerializer,
    HabitSerializer,
    HabitToggleSerializer,
    JournalEntrySerializer,
    LifeExperienceEventSerializer,
    MilestoneSerializer,
    MoodEntrySerializer,
    ReadingLogSerializer,
    SleepEntrySerializer,
)
from .services import (
    dashboard_data,
    delete_habit_completion,
    expense_analytics,
    expense_monthly,
    expense_trends,
    focus_stats,
    goals_stats,
    create_habit_completion,
    experience_summary,
    habit_calendar,
    habit_categories,
    habit_stats,
    mood_stats,
    mood_trends,
    reading_stats,
    focus_trends,
    sleep_report,
    sleep_stats,
    sleep_trends,
    sleep_weekly,
    journal_stats,
)
from apps.notifications.services import NotificationService


class UserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    search_fields: list[str] = []
    date_field: str | None = None

    def get_queryset(self) -> QuerySet:
        queryset = self.queryset.filter(user=self.request.user)
        if self.search_fields:
            queryset = apply_search(queryset, self.request.query_params, self.search_fields)
        if self.date_field:
            queryset = apply_date_filters(queryset, self.date_field, self.request.query_params)
        return queryset


class HabitViewSet(UserOwnedViewSet):
    queryset = Habit.objects.all().prefetch_related('completions')
    serializer_class = HabitSerializer
    search_fields = ['name', 'description', 'category']

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        active = self.request.query_params.get('active')
        if category:
            queryset = queryset.filter(category=category)
        if active in {'true', 'false'}:
            queryset = queryset.filter(is_active=active == 'true')
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(habit_stats(request.user))

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        return Response(
            habit_calendar(
                request.user,
                start=request.query_params.get('start'),
                end=request.query_params.get('end'),
            )
        )

    @action(detail=False, methods=['get'])
    def categories(self, request):
        return Response(habit_categories())

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        serializer = HabitToggleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        habit = serializer.validated_data['habit']
        completed_on = serializer.validated_data['completed_on']
        existing = HabitCompletion.objects.filter(user=request.user, habit=habit, completed_on=completed_on).first()
        if existing:
            delete_habit_completion(existing)
            return Response({'completed': False, 'habit': habit.id, 'completed_on': completed_on, 'xp_awarded': 0})
        completion, _created = create_habit_completion(
            user=request.user,
            habit=habit,
            completed_on=completed_on,
            note=serializer.validated_data.get('note', ''),
        )
        
        # Send notification when habit is completed
        try:
            NotificationService.create_habit_reminder(
                user=request.user,
                habit_name=habit.name,
                habit_id=habit.id
            )
        except Exception as e:
            # Log error but don't fail the request
            print(f"Notification error: {str(e)}")
        
        return Response(
            {
                'completed': True,
                'habit': habit.id,
                'completed_on': completed_on,
                'completion': HabitCompletionSerializer(completion, context={'request': request}).data,
                'xp_awarded': 20,
            }
        )


class HabitCompletionViewSet(UserOwnedViewSet):
    queryset = HabitCompletion.objects.all().select_related('habit')
    serializer_class = HabitCompletionSerializer
    date_field = 'completed_on'

    def perform_destroy(self, instance):
        delete_habit_completion(instance)


class LifeExperienceEventViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LifeExperienceEventSerializer

    def get_queryset(self) -> QuerySet:
        queryset = LifeExperienceEvent.objects.filter(user=self.request.user)
        return apply_date_filters(queryset, 'earned_on', self.request.query_params)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        return Response(experience_summary(request.user))


class MoodEntryViewSet(UserOwnedViewSet):
    queryset = MoodEntry.objects.all()
    serializer_class = MoodEntrySerializer
    search_fields = ['label', 'note']
    date_field = 'logged_on'

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        mood = self.request.query_params.get('mood')
        if mood:
            queryset = queryset.filter(mood=mood)
        return queryset

    def perform_create(self, serializer):
        """Send notification when mood is logged"""
        instance = serializer.save(user=self.request.user)
        
        # Send notification
        try:
            NotificationService.create_mood_reminder(self.request.user)
        except Exception as e:
            print(f"Mood notification error: {str(e)}")
        
        return instance

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(mood_stats(request.user))

    @action(detail=False, methods=['get'])
    def trends(self, request):
        return Response(mood_trends(request.user, request.query_params.get('period', 'weekly')))

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        entries = apply_date_filters(self.get_queryset(), 'logged_on', request.query_params)
        return Response(list(entries.values('id', 'logged_on', 'mood', 'emoji', 'label', 'score', 'note').order_by('logged_on')))


class SleepEntryViewSet(UserOwnedViewSet):
    queryset = SleepEntry.objects.all()
    serializer_class = SleepEntrySerializer
    search_fields = ['note']
    date_field = 'slept_on'

    def perform_create(self, serializer):
        """Send notification when sleep is logged"""
        instance = serializer.save(user=self.request.user)
        
        # Send notification
        try:
            NotificationService.create_sleep_reminder(self.request.user)
        except Exception as e:
            print(f"Sleep notification error: {str(e)}")
        
        return instance

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(sleep_stats(request.user))

    @action(detail=False, methods=['get'])
    def weekly(self, request):
        return Response(sleep_weekly(request.user))

    @action(detail=False, methods=['get'])
    def trends(self, request):
        return Response(sleep_trends(request.user, request.query_params.get('period', 'weekly')))

    @action(detail=False, methods=['get'])
    def report(self, request):
        return Response(sleep_report(request.user, request.query_params.get('period', 'weekly')))

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        entries = apply_date_filters(self.get_queryset(), 'slept_on', request.query_params)
        return Response(list(entries.values('id', 'slept_on', 'duration_minutes', 'quality', 'bedtime', 'wake_time', 'note').order_by('slept_on')))


class FocusSessionViewSet(UserOwnedViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer
    search_fields = ['subject', 'notes']
    date_field = 'started_at'

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        subject = self.request.query_params.get('subject')
        session_type = self.request.query_params.get('session_type')
        completed = self.request.query_params.get('completed')
        if subject:
            queryset = queryset.filter(subject__icontains=subject)
        if session_type:
            queryset = queryset.filter(session_type=session_type)
        if completed in {'true', 'false'}:
            queryset = queryset.filter(completed=completed == 'true')
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(focus_stats(request.user))

    @action(detail=False, methods=['get'])
    def trends(self, request):
        return Response(focus_trends(request.user, request.query_params.get('period', 'weekly')))

    @action(detail=False, methods=['get'])
    def calendar(self, request):
        sessions = apply_date_filters(self.get_queryset(), 'started_at', request.query_params)
        # Use serializer instead of values() to properly handle datetime serialization
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        serializer = self.get_serializer(session, data={**request.data, 'completed': True, 'ended_at': request.data.get('ended_at') or timezone.now()}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Send notification when focus session is completed
        try:
            NotificationService.create_focus_reminder(self.request.user)
        except Exception as e:
            print(f"Focus notification error: {str(e)}")
        
        return Response(serializer.data)


class ExpenseCategoryViewSet(UserOwnedViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    search_fields = ['name']

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        category_type = self.request.query_params.get('category_type')
        is_active = self.request.query_params.get('is_active')
        
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        if is_active in {'true', 'false'}:
            queryset = queryset.filter(is_active=is_active == 'true')
        
        return queryset.prefetch_related('entries')
    
    def create(self, request, *args, **kwargs):
        """Create a new category with validation error handling"""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"Serializer errors: {serializer.errors}")
            return Response({'error': 'Validation failed', 'details': serializer.errors}, status=400)
        try:
            self.perform_create(serializer)
        except Exception as e:
            from django.db import IntegrityError
            import traceback
            error_msg = str(e)
            print(f"Create error: {error_msg}")
            print(traceback.format_exc())
            
            if isinstance(e, IntegrityError):
                # Check if it's a unique constraint error
                if 'UNIQUE constraint failed' in error_msg and 'user_id' in error_msg:
                    cat_name = request.data.get('name', 'This category')
                    return Response({
                        'error': f'A category named "{cat_name}" already exists for you.',
                        'code': 'duplicate_category'
                    }, status=400)
                return Response({'error': 'Database constraint violation', 'code': 'integrity_error'}, status=400)
            
            return Response({'error': error_msg}, status=400)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get category statistics"""
        categories = self.get_queryset()
        return Response({
            'total': categories.count(),
            'active': categories.filter(is_active=True).count(),
            'income': categories.filter(category_type=ExpenseCategory.CategoryType.INCOME).count(),
            'expense': categories.filter(category_type=ExpenseCategory.CategoryType.EXPENSE).count(),
        })


class ExpenseEntryViewSet(UserOwnedViewSet):
    queryset = ExpenseEntry.objects.all().select_related('category')
    serializer_class = ExpenseEntrySerializer
    search_fields = ['description', 'notes', 'category__name']
    date_field = 'occurred_on'

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        entry_type = self.request.query_params.get('entry_type')
        payment_method = self.request.query_params.get('payment_method')
        category = self.request.query_params.get('category')
        is_recurring = self.request.query_params.get('is_recurring')
        
        if entry_type:
            queryset = queryset.filter(entry_type=entry_type)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if category:
            queryset = queryset.filter(category_id=category)
        if is_recurring in {'true', 'false'}:
            queryset = queryset.filter(is_recurring=is_recurring == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """Send notification when expense is logged"""
        instance = serializer.save(user=self.request.user)
        
        # Send notification
        try:
            NotificationService.create_expense_reminder(self.request.user)
        except Exception as e:
            print(f"Expense notification error: {str(e)}")
        
        return instance

    @action(detail=False, methods=['get'])
    def monthly(self, request):
        try:
            return Response(expense_monthly(request.user))
        except Exception as e:
            import traceback
            print(f"Monthly error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e), 'month': '', 'income': 0, 'expense': 0, 'net': 0, 'savings_rate': 0, 'by_category': []}, status=200)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        try:
            return Response(expense_analytics(request.user))
        except Exception as e:
            import traceback
            print(f"Analytics error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e), 'monthly': {'income': 0, 'expense': 0, 'net': 0, 'savings_rate': 0}, 'yearly': {'income': 0, 'expense': 0, 'net': 0, 'savings_rate': 0}, 'by_payment': [], 'top_categories': [], 'recent': []}, status=200)
    
    @action(detail=False, methods=['get'])
    def trends(self, request):
        try:
            return Response(expense_trends(request.user))
        except Exception as e:
            import traceback
            print(f"Trends error: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=200)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get comprehensive expense summary"""
        return Response({
            'monthly': expense_monthly(request.user),
            'analytics': expense_analytics(request.user),
            'trends': expense_trends(request.user),
        })


class GoalViewSet(UserOwnedViewSet):
    queryset = Goal.objects.all().prefetch_related('milestones')
    serializer_class = GoalSerializer
    search_fields = ['title', 'description']
    date_field = 'deadline'

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        category = self.request.query_params.get('category')
        
        if status:
            queryset = queryset.filter(status=status)
        if priority:
            queryset = queryset.filter(priority=priority)
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(goals_stats(request.user))

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        from .services import update_goal_progress

        goal = self.get_object()
        return Response(GoalSerializer(update_goal_progress(goal), context={'request': request}).data)
    
    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """Get goal timeline with deadlines"""
        goals = self.get_queryset().filter(deadline__isnull=False).order_by('deadline')
        serializer = self.get_serializer(goals, many=True)
        return Response(serializer.data)


class MilestoneViewSet(UserOwnedViewSet):
    queryset = Milestone.objects.all().select_related('goal')
    serializer_class = MilestoneSerializer
    search_fields = ['title']
    date_field = 'due_date'


class BookViewSet(UserOwnedViewSet):
    queryset = Book.objects.all().prefetch_related('logs')
    serializer_class = BookSerializer
    search_fields = ['title', 'author']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(reading_stats(request.user))


class ReadingLogViewSet(UserOwnedViewSet):
    queryset = ReadingLog.objects.all().select_related('book')
    serializer_class = ReadingLogSerializer
    search_fields = ['book__title', 'note']
    date_field = 'read_on'

    def perform_create(self, serializer):
        """Send notification when reading log is created"""
        instance = serializer.save(user=self.request.user)
        
        # Send notification
        try:
            book = instance.book
            NotificationService.create_reading_reminder(
                self.request.user,
                book_title=book.title if book else None
            )
        except Exception as e:
            print(f"Reading notification error: {str(e)}")
        
        return instance


class JournalEntryViewSet(UserOwnedViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    search_fields = ['title', 'content']
    date_field = 'entry_date'

    def get_queryset(self) -> QuerySet:
        queryset = super().get_queryset()
        tag = self.request.query_params.get('tag')
        is_pinned = self.request.query_params.get('is_pinned')
        is_favorite = self.request.query_params.get('is_favorite')
        mood = self.request.query_params.get('mood')
        
        if tag:
            queryset = queryset.filter(tags__contains=[tag.lower()])
        if is_pinned in {'true', 'false'}:
            queryset = queryset.filter(is_pinned=is_pinned == 'true')
        if is_favorite in {'true', 'false'}:
            queryset = queryset.filter(is_favorite=is_favorite == 'true')
        if mood:
            queryset = queryset.filter(mood=mood)
        
        return queryset

    def perform_create(self, serializer):
        """Send notification when journal entry is created"""
        instance = serializer.save(user=self.request.user)
        
        # Send achievement notification for journaling
        try:
            NotificationService.create_achievement_notification(
                self.request.user,
                f"Journal Entry Created: {instance.title[:30]}..."
            )
        except Exception as e:
            print(f"Journal notification error: {str(e)}")
        
        return instance

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response(journal_stats(request.user))
    
    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pin status of an entry"""
        entry = self.get_object()
        entry.is_pinned = not entry.is_pinned
        entry.save(update_fields=['is_pinned', 'updated_at'])
        return Response(self.get_serializer(entry).data)
    
    @action(detail=True, methods=['post'])
    def toggle_favorite(self, request, pk=None):
        """Toggle favorite status of an entry"""
        entry = self.get_object()
        entry.is_favorite = not entry.is_favorite
        entry.save(update_fields=['is_favorite', 'updated_at'])
        return Response(self.get_serializer(entry).data)
    
    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """Get journal entries in timeline format"""
        entries = self.get_queryset().order_by('-entry_date', '-created_at')
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)


class LifeOSDataLayerViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        return Response(dashboard_data(request.user))
