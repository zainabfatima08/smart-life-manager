from django.urls import path
from .views import (
    SummaryView,
    LifeScoreView,
    ActivityTimelineView,
    InsightsView,
)

urlpatterns = [
    path('summary/', SummaryView.as_view(), name='dashboard-summary'),
    path('life-score/', LifeScoreView.as_view(), name='dashboard-life-score'),
    path('activity-timeline/', ActivityTimelineView.as_view(), name='dashboard-activity-timeline'),
    path('insights/', InsightsView.as_view(), name='dashboard-insights'),
]