from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BookViewSet,
    ExpenseCategoryViewSet,
    ExpenseEntryViewSet,
    FocusSessionViewSet,
    GoalViewSet,
    HabitCompletionViewSet,
    HabitViewSet,
    JournalEntryViewSet,
    LifeExperienceEventViewSet,
    LifeOSDataLayerViewSet,
    MilestoneViewSet,
    MoodEntryViewSet,
    ReadingLogViewSet,
    SleepEntryViewSet,
)

router = DefaultRouter()
router.register('habits', HabitViewSet, basename='habits')
router.register('habit-completions', HabitCompletionViewSet, basename='habit-completions')
router.register('experience', LifeExperienceEventViewSet, basename='experience')
router.register('mood', MoodEntryViewSet, basename='mood')
router.register('sleep', SleepEntryViewSet, basename='sleep')
router.register('focus', FocusSessionViewSet, basename='focus')
router.register('expense-categories', ExpenseCategoryViewSet, basename='expense-categories')
router.register('expenses', ExpenseEntryViewSet, basename='expenses')
router.register('goals', GoalViewSet, basename='goals')
router.register('milestones', MilestoneViewSet, basename='milestones')
router.register('books', BookViewSet, basename='books')
router.register('reading-logs', ReadingLogViewSet, basename='reading-logs')
router.register('journal', JournalEntryViewSet, basename='journal')
router.register('life-data', LifeOSDataLayerViewSet, basename='life-data')

urlpatterns = [path('', include(router.urls))]
