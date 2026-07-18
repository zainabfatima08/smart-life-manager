from django.contrib import admin

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


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'target_per_week', 'color', 'icon', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'color')
    search_fields = ('name', 'description', 'user__email', 'user__username')


@admin.register(HabitCompletion)
class HabitCompletionAdmin(admin.ModelAdmin):
    list_display = ('habit', 'user', 'completed_on')
    list_filter = ('completed_on',)
    search_fields = ('habit__name', 'user__email', 'user__username')


@admin.register(LifeExperienceEvent)
class LifeExperienceEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'source', 'points', 'reason', 'earned_on', 'created_at')
    list_filter = ('source', 'earned_on')
    search_fields = ('reason', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'logged_on', 'emoji', 'label', 'mood', 'score', 'updated_at')
    list_filter = ('mood', 'score', 'logged_on')
    date_hierarchy = 'logged_on'
    search_fields = ('label', 'note', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SleepEntry)
class SleepEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'slept_on', 'duration_minutes', 'quality', 'bedtime', 'wake_time')
    list_filter = ('slept_on', 'quality')
    date_hierarchy = 'slept_on'
    search_fields = ('note', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(FocusSession)
class FocusSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'subject', 'session_type', 'started_at', 'duration_minutes', 'completed', 'productivity_rating')
    list_filter = ('completed', 'session_type', 'subject')
    date_hierarchy = 'started_at'
    search_fields = ('subject', 'notes', 'user__email', 'user__username')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'monthly_budget')
    search_fields = ('name', 'user__email', 'user__username')


@admin.register(ExpenseEntry)
class ExpenseEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'entry_type', 'amount', 'occurred_on')
    list_filter = ('entry_type', 'occurred_on')
    search_fields = ('description', 'category__name', 'user__email', 'user__username')


class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 0


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'deadline', 'progress_percent')
    list_filter = ('status', 'deadline')
    search_fields = ('title', 'description', 'user__email', 'user__username')
    inlines = [MilestoneInline]


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'goal', 'user', 'due_date', 'completed')
    list_filter = ('completed', 'due_date')
    search_fields = ('title', 'goal__title', 'user__email', 'user__username')


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'user', 'current_page', 'total_pages', 'finished_on')
    search_fields = ('title', 'author', 'user__email', 'user__username')


@admin.register(ReadingLog)
class ReadingLogAdmin(admin.ModelAdmin):
    list_display = ('book', 'user', 'pages_read', 'read_on')
    list_filter = ('read_on',)
    search_fields = ('book__title', 'note', 'user__email', 'user__username')


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'entry_date', 'updated_at')
    list_filter = ('entry_date',)
    search_fields = ('title', 'content', 'user__email', 'user__username')
