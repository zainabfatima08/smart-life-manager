import { api } from './api';

export interface ActivityTimeline {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  data: Record<string, any>;
}

export interface DashboardSummary {
  habits_completed: number;
  habits_total: number;
  current_mood: string | null;
  sleep_hours: number;
  focus_minutes: number;
  expenses_today: number;
  active_goals: number;
  journal_entries: number;
}

export interface LifeScore {
  overall_score: number;
  productivity_score: number;
  wellness_score: number;
  finance_score: number;
  growth_score: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ActivityTimelineResponse {
  count: number;
  next: boolean;
  previous: boolean;
  page: number;
  page_size: number;
  total_pages: number;
  results: ActivityTimeline[];
}

export interface DashboardInsight {
  title: string;
  description: string;
  icon: string;
  type: 'positive' | 'warning' | 'neutral';
  value: string;
}

export const dashboardAPI = {
  getSummary: async (): Promise<DashboardSummary> => {
    return api('/dashboard/summary/');
  },

  getLifeScore: async (): Promise<LifeScore> => {
    return api('/dashboard/life-score/');
  },

  getActivityTimeline: async (days = 7, filter = 'all', page = 1, pageSize = 10): Promise<ActivityTimelineResponse> => {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (filter !== 'all') {
      params.append('type', filter);
    }
    return api(`/dashboard/activity-timeline/?${params.toString()}`);
  },

  getInsights: async (): Promise<DashboardInsight[]> => {
    return api('/dashboard/insights/');
  },
};
