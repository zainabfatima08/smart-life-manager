'use client';

import { motion } from 'motion/react';
import { Check, Moon, Zap, Wallet, Target, BookOpen, PenTool, Heart } from 'lucide-react';
import { DashboardSummary } from '@/lib/dashboard';

interface TodayOverviewProps {
  summary: DashboardSummary;
  isLoading?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const counterVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};

export function TodayOverview({ summary, isLoading }: TodayOverviewProps) {
  const cards = [
    {
      title: 'Habits',
      value: summary.habits_completed,
      total: summary.habits_total,
      icon: Check,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Mood',
      value: summary.current_mood || '—',
      total: null,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      title: 'Sleep',
      value: Math.round(summary.sleep_hours * 10) / 10,
      total: 'hrs',
      icon: Moon,
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Focus Time',
      value: Math.round(summary.focus_minutes / 60 * 10) / 10,
      total: 'hrs',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Expenses',
      value: `Rs ${summary.expenses_today.toFixed(0)}`,
      total: 'today',
      icon: Wallet,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Goals',
      value: summary.active_goals,
      total: 'goals',
      icon: Target,
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      title: 'Reading',
      value: summary.journal_entries,
      total: 'pages',
      icon: BookOpen,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      title: 'Journal',
      value: summary.journal_entries,
      total: 'entries',
      icon: PenTool,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-12">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6 text-2xl font-bold text-slate-900"
      >
        Today's Overview
      </motion.h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -6, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
              className={`group relative overflow-hidden rounded-2xl ${card.bgColor} p-6 backdrop-blur-sm transition-all hover:shadow-lg cursor-pointer border border-white/60`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity group-hover:opacity-5`} />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="mb-3 text-xs font-medium text-slate-600 uppercase tracking-wider">{card.title}</p>
                    <motion.div
                      variants={counterVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="truncate"
                    >
                      <p className={`text-2xl font-bold ${card.textColor} truncate`}>{card.value}</p>
                      {card.total && <p className="text-xs text-slate-500 mt-1">{card.total}</p>}
                    </motion.div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`rounded-lg bg-gradient-to-br ${card.color} p-3 text-white shadow-md flex-shrink-0`}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                </div>
              </div>

              {/* Hover action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/5 to-transparent px-6 py-3 text-center"
              >
                <p className="text-xs font-medium text-slate-600">View Details</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
