'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { dashboardAPI, DashboardSummary, LifeScore, ActivityTimeline, DashboardInsight, ActivityTimelineResponse } from '@/lib/dashboard';
import { HeroSection } from '@/components/dashboard/hero-section';
import { TodayOverview } from '@/components/dashboard/today-overview';
import { LifeScoreDashboard } from '@/components/dashboard/life-score';
import { Insights } from '@/components/dashboard/insights';
import { ActivityTimeline as ActivityTimelineComponent } from '@/components/dashboard/activity-timeline';
import { CompanionWidget } from '@/components/dashboard/companion-widget';
import { AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lifeScore, setLifeScore] = useState<LifeScore | null>(null);
  const [activitiesData, setActivitiesData] = useState<ActivityTimelineResponse | null>(null);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('User');
  const [activityDays, setActivityDays] = useState(7);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);

        // Only fetch activity timeline when filter/page changes
        // Don't fetch summary, life score on every filter change
        const activityPromise = dashboardAPI.getActivityTimeline(activityDays, activityFilter, activityPage, activityPageSize).catch((e) => {
          return null;
        });

        const activitiesResponseData = await activityPromise;
        if (activitiesResponseData) setActivitiesData(activitiesResponseData);
      } catch (err) {
      }
    };

    fetchDashboardData();
  }, [activityDays, activityFilter, activityPage, activityPageSize]);

  // Initial load - fetch all dashboard data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [summaryData, lifeScoreData, activitiesResponseData, insightsData] = await Promise.all([
          dashboardAPI.getSummary().catch((e) => {
            return null;
          }),
          dashboardAPI.getLifeScore().catch((e) => {
            return null;
          }),
          dashboardAPI.getActivityTimeline(7, 'all', 1, 10).catch((e) => {
            return null;
          }),
          dashboardAPI.getInsights().catch((e) => {
            return [];
          }),
        ]);

        if (summaryData) setSummary(summaryData);
        if (lifeScoreData) setLifeScore(lifeScoreData);
        if (activitiesResponseData) setActivitiesData(activitiesResponseData);
        if (insightsData) setInsights(insightsData);

        // Get user name from localStorage
        const userName = localStorage.getItem('userName') || 'User';
        setUserName(userName);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchInitialData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error && !summary) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-lg text-red-900">{error}</p>
            <p className="mt-2 text-sm text-red-700">Please try refreshing the page</p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 relative z-10">
        {/* Hero Section */}
        <HeroSection
          userName={userName}
          dailyProgress={summary ? (summary.habits_completed / Math.max(summary.habits_total, 1)) * 100 : 0}
        />

        {/* Today's Overview */}
        {summary && <TodayOverview summary={summary} isLoading={loading} />}

        {/* Life Score Dashboard */}
        {lifeScore && <LifeScoreDashboard lifeScore={lifeScore} isLoading={loading} />}

        {/* Insights */}
        <Insights insights={insights} isLoading={loading} />

        {/* Activity Timeline */}
        <ActivityTimelineComponent 
          activities={activitiesData?.results || []} 
          isLoading={loading}
          days={activityDays}
          onDaysChange={setActivityDays}
          filter={activityFilter}
          onFilterChange={setActivityFilter}
          pagination={{
            page: activityPage,
            pageSize: activityPageSize,
            totalPages: activitiesData?.total_pages || 0,
            totalCount: activitiesData?.count || 0,
            hasNext: activitiesData?.next || false,
            hasPrevious: activitiesData?.previous || false,
          }}
          onPageChange={setActivityPage}
          onPageSizeChange={setActivityPageSize}
        />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-slate-500"
        >
          <p>Life OS Dashboard • Last updated: {new Date().toLocaleTimeString()}</p>
        </motion.div>
      </div>

      {/* Companion Widget */}
      {lifeScore && (
        <CompanionWidget
          lifeScore={lifeScore.overall_score}
          habitsCompleted={summary?.habits_completed || 0}
          activeGoals={summary?.active_goals || 0}
        />
      )}
    </main>
  );
}