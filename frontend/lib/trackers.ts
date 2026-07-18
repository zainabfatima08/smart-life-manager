'use client';

import { api } from './api';

export type TrackerKind = 'habits' | 'mood' | 'sleep' | 'focus' | 'expenses' | 'goals' | 'reading' | 'journal';

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Habit = {
  id: number;
  name: string;
  category: string;
  description: string;
  target_per_week: number;
  color: string;
  icon: string;
  is_active: boolean;
  current_streak: number;
  longest_streak: number;
  completed_today: boolean;
  completions_last_30_days: number;
};

export type HabitStats = {
  total_habits: number;
  active_habits: number;
  completed_last_30_days: number;
  completed_today: number;
  completion_rate: number;
  weekly_total: number;
  monthly_total: number;
  by_category: { category: string; total: number }[];
  weekly: { completed_on: string; count: number }[];
  monthly: { completed_on: string; count: number }[];
  top_streaks: { id: number; name: string; category: string; color: string; current: number; longest: number }[];
  calendar: { completed_on: string; count: number }[];
  xp: ExperienceSummary;
};

export type ExperienceSummary = {
  total_xp: number;
  level: number;
  level_progress: number;
  level_target: number;
  daily_xp: number;
  weekly_xp: number;
  recent: { source: string; points: number; reason: string; earned_on: string }[];
};

export type HabitCalendarEntry = {
  id: number;
  habit_id: number;
  habit_name: string;
  category: string;
  color: string;
  completed_on: string;
  note: string;
  xp: number;
};

export type MoodEntry = {
  id: number;
  mood: string;
  emoji: string;
  label: string;
  score: number;
  note: string;
  logged_on: string;
};

export type MoodStats = {
  total_entries: number;
  average_score: number;
  weekly_average: number;
  monthly_average: number;
  current_streak: number;
  latest: MoodSummary | null;
  best_mood: MoodSummary | null;
  distribution: { mood: string; label: string; emoji: string; total: number }[];
  weekly: { logged_on: string; avg_score: number; entries: number }[];
  monthly: { logged_on: string; avg_score: number; entries: number }[];
  recent_notes: MoodEntry[];
};

export type MoodSummary = {
  mood: string;
  emoji: string;
  label: string;
  score: number;
  logged_on: string;
};

export type SleepEntry = {
  id: number;
  slept_on: string;
  duration_minutes: number;
  quality: number;
  bedtime: string | null;
  wake_time: string | null;
  note: string;
};

export type SleepStats = {
  total_entries: number;
  weekly_average_minutes: number;
  monthly_average_minutes: number;
  weekly_average_quality: number;
  monthly_average_quality: number;
  current_streak: number;
  latest: SleepEntry | null;
  best_sleep: SleepEntry | null;
  daily: SleepEntry[];
  weekly: { period: string; avg_minutes: number; avg_quality: number; entries: number }[];
  monthly: { period: string; avg_minutes: number; avg_quality: number; entries: number }[];
};

export type SleepReport = {
  period: string;
  start: string;
  end: string;
  entries: number;
  average_duration_minutes: number;
  average_quality: number;
  nights: SleepEntry[];
};

export type FocusSession = {
  id: number;
  subject: string;
  session_type: 'pomodoro' | 'deep_work' | 'study' | 'review';
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  completed: boolean;
  productivity_rating: number;
  notes: string;
};

export type FocusStats = {
  total_sessions: number;
  completed_sessions: number;
  today_minutes: number;
  weekly_minutes: number;
  monthly_minutes: number;
  total_minutes: number;
  average_productivity: number;
  current_streak: number;
  by_subject: { subject: string; minutes: number; sessions: number }[];
  by_type: { session_type: string; minutes: number; sessions: number }[];
  daily: { day: string; minutes: number; sessions: number; avg_productivity: number }[];
  recent: FocusSession[];
};

export type FocusTrend = {
  period: string;
  minutes: number;
  sessions: number;
  avg_productivity: number;
};

export type ExpenseCategory = {
  id: number;
  name: string;
  monthly_budget: number;
  category_type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  is_active: boolean;
  total_spent?: number;
  budget_remaining?: number;
  entries_count?: number;
};

export type ExpenseEntry = {
  id: number;
  category: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  entry_type: 'income' | 'expense';
  amount: string;
  occurred_on: string;
  description: string;
  payment_method: 'cash' | 'card' | 'bank' | 'digital' | 'other';
  notes: string;
  is_recurring: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ExpenseStats = {
  monthly: {
    income: number;
    expense: number;
    net: number;
    savings_rate: number;
  };
  yearly: {
    income: number;
    expense: number;
    net: number;
    savings_rate: number;
  };
  by_payment: Array<{ payment_method: string; total: number }>;
  top_categories: Array<{ name: string; icon: string; color: string; total: number }>;
  recent: ExpenseEntry[];
};

export type Goal = {
  id: number;
  title: string;
  description: string;
  category: 'personal' | 'career' | 'health' | 'finance' | 'education' | 'relationship' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline: string | null;
  target_value: number;
  current_value: number;
  progress_percent: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'archived';
  color: string;
  icon: string;
  notes: string;
  reminder_enabled: boolean;
  milestones: Milestone[];
  milestone_count: number;
  completed_milestones: number;
  days_until_deadline: number | null;
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: number;
  goal: number;
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  order: number;
  created_at: string;
  updated_at: string;
};

export type GoalStats = {
  total: number;
  by_status: {
    not_started: number;
    in_progress: number;
    completed: number;
    paused: number;
    archived: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  by_category: Array<{ category: string; total: number }>;
  average_progress: number;
  completion_rate: number;
  upcoming_deadlines: Array<{
    id: number;
    title: string;
    deadline: string | null;
    days_remaining: number | null;
    priority: string;
    progress_percent: number;
  }>;
  overdue_count: number;
  total_milestones: number;
  completed_milestones: number;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  total_pages: number;
  current_page: number;
  reading_goal_pages_per_day: number;
  progress_percent: number;
};

export type ReadingLog = {
  id: number;
  book: number;
  book_title: string;
  pages_read: number;
  read_on: string;
  note: string;
};

export type JournalEntry = {
  id: number;
  title: string;
  content: string;
  tags: string[];
  entry_date: string;
  is_pinned: boolean;
  is_favorite: boolean;
  word_count: number;
  word_count_computed: number;
  mood: string;
  created_at: string;
  updated_at: string;
};

export type JournalStats = {
  entries: number;
  pinned: number;
  favorites: number;
  current_streak: number;
  total_words: number;
  average_words: number;
  top_tags: Array<{ tag: string; count: number }>;
  recent: Array<{
    id: number;
    title: string;
    entry_date: string;
    word_count: number;
    is_pinned: boolean;
    is_favorite: boolean;
    tags: string[];
  }>;
  mood_distribution: Array<{ mood: string; count: number }>;
};

export const trackerEndpoints = {
  habits: '/habits/',
  habitCompletions: '/habit-completions/',
  experience: '/experience/',
  mood: '/mood/',
  sleep: '/sleep/',
  focus: '/focus/',
  expenseCategories: '/expense-categories/',
  expenses: '/expenses/',
  goals: '/goals/',
  milestones: '/milestones/',
  books: '/books/',
  readingLogs: '/reading-logs/',
  journal: '/journal/',
  lifeData: '/life-data/',
} as const;

export async function listTracker<T>(endpoint: string, params?: Record<string, string>): Promise<Paginated<T>> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return api(`${endpoint}${query}`);
}

export async function createTracker<T>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
  return api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateTracker<T>(endpoint: string, id: number, payload: Record<string, unknown>): Promise<T> {
  return api(`${endpoint}${id}/`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteTracker(endpoint: string, id: number): Promise<void> {
  await api(`${endpoint}${id}/`, { method: 'DELETE' });
}

export async function trackerAction<T>(endpoint: string, action: string, params?: Record<string, string>): Promise<T> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return api(`${endpoint}${action}/${query}`);
}

export async function postTrackerAction<T>(endpoint: string, action: string, payload: Record<string, unknown>): Promise<T> {
  return api(`${endpoint}${action}/`, { method: 'POST', body: JSON.stringify(payload) });
}

export function todayISO(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function nowLocalInput(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
