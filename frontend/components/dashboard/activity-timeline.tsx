'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActivityTimeline } from '@/lib/dashboard';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ActivityTimelineProps {
  activities: ActivityTimeline[];
  isLoading?: boolean;
  days?: number;
  onDaysChange?: (days: number) => void;
  filter?: string;
  onFilterChange?: (filter: string) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Check: LucideIcons.Check,
    Smile: LucideIcons.Smile,
    Zap: LucideIcons.Zap,
    Target: LucideIcons.Target,
    BookOpen: LucideIcons.BookOpen,
    BookMarked: LucideIcons.BookMarked,
    Moon: LucideIcons.Moon,
    PenTool: LucideIcons.PenTool,
    Heart: LucideIcons.Heart,
    TrendingUp: LucideIcons.TrendingUp,
    Wallet: LucideIcons.Wallet,
  };
  return icons[iconName] || LucideIcons.Activity;
};

const colorMap: Record<string, { dot: string; line: string }> = {
  blue: { dot: 'bg-blue-500', line: 'from-blue-500' },
  green: { dot: 'bg-green-500', line: 'from-green-500' },
  purple: { dot: 'bg-purple-500', line: 'from-purple-500' },
  amber: { dot: 'bg-amber-500', line: 'from-amber-500' },
  orange: { dot: 'bg-orange-500', line: 'from-orange-500' },
  red: { dot: 'bg-red-500', line: 'from-red-500' },
  pink: { dot: 'bg-pink-500', line: 'from-pink-500' },
};

const ACTIVITY_TYPES = [
  { id: 'all', label: 'All Activities' },
  { id: 'habit', label: 'Habits' },
  { id: 'mood', label: 'Mood' },
  { id: 'focus', label: 'Focus' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'reading', label: 'Reading' },
  { id: 'journal', label: 'Journal' },
  { id: 'goal', label: 'Goals' },
  { id: 'expense', label: 'Expenses' },
];

const TIME_RANGES = [
  { id: 7, label: 'Last 7 days' },
  { id: 14, label: 'Last 14 days' },
  { id: 30, label: 'Last 30 days' },
  { id: 90, label: 'Last 90 days' },
];

export function ActivityTimeline({
  activities,
  isLoading = false,
  days = 7,
  onDaysChange,
  filter = 'all',
  onFilterChange,
  pagination,
  onPageChange,
  onPageSizeChange,
}: ActivityTimelineProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const handleFilterChange = (newFilter: string) => {
    setLocalLoading(true);
    onFilterChange?.(newFilter);
    // Simulate loading state for UI feedback
    setTimeout(() => setLocalLoading(false), 500);
  };

  const handleDaysChange = (newDays: number) => {
    setLocalLoading(true);
    onDaysChange?.(newDays);
    setTimeout(() => setLocalLoading(false), 500);
  };

  const handlePageChange = (page: number) => {
    setLocalLoading(true);
    onPageChange?.(page);
    setTimeout(() => setLocalLoading(false), 500);
  };

  const startFrom = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 1;
  const endTo = Math.min(startFrom + (activities.length - 1), pagination?.totalCount || activities.length);

  if (isLoading && activities.length === 0) {
    return (
      <div className="mb-12 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0 && !localLoading) {
    return (
      <div className="mb-12 rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center">
        <p className="text-slate-500">No activities recorded yet. Start tracking to see your timeline!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Activity Timeline</h2>

        {/* Filters and Controls */}
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200 relative">
          {/* Loading overlay */}
          {localLoading && (
            <div className="absolute inset-0 bg-white/50 rounded-xl backdrop-blur-sm flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-200 border-t-indigo-600"></div>
            </div>
          )}

          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Time Range:</span>
            <div className="flex gap-2 flex-wrap">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => handleDaysChange(range.id)}
                  disabled={localLoading}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    days === range.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              disabled={localLoading}
              className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Control */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Show:</span>
            <select
              value={pagination?.pageSize || 10}
              onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
              disabled={localLoading}
              className="px-3 py-1.5 rounded-lg text-sm border border-slate-300 bg-white hover:border-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        {pagination && pagination.totalCount > 0 && (
          <div className="text-sm text-slate-500 mb-4">
            Showing {startFrom} to {endTo} of {pagination.totalCount} activities
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-slate-300" />

        {/* Activities */}
        <div className="space-y-6">
          {activities.map((activity, index) => {
            const Icon = getIcon(activity.icon);
            const colors = colorMap[activity.color] || colorMap.blue;
            const timestamp = new Date(activity.timestamp);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.05, duration: 0.4 }}
                  className={`absolute -left-6 top-1 h-7 w-7 rounded-full ${colors.dot} shadow-lg ring-4 ring-white flex items-center justify-center`}
                >
                  <Icon className="h-3.5 w-3.5 text-white" />
                </motion.div>

                {/* Activity card */}
                <motion.div
                  whileHover={{ x: 4 }}
                  className="flex cursor-pointer items-start gap-4 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500">
                        {format(timestamp, 'MMM dd, HH:mm')}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {activity.activity_type}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`flex-shrink-0 rounded-lg bg-gradient-to-br ${colors.line} to-slate-600 p-2 text-white`}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious || localLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
            </span>
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext || localLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
