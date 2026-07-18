'use client';

import { motion } from 'motion/react';
import { LifeScore } from '@/lib/dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LifeScoreProps {
  lifeScore: LifeScore;
  isLoading?: boolean;
}

const ScoreRing = ({
  score,
  label,
  color,
  delay,
}: {
  score: number;
  label: string;
  color: string;
  delay: number;
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center"
    >
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
            animate={{ strokeDashoffset: offset }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.5, duration: 0.6 }}
            className="text-2xl font-bold text-slate-900"
          >
            {score}
          </motion.p>
          <p className="text-xs text-slate-500">/100</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </motion.div>
  );
};

export function LifeScoreDashboard({ lifeScore, isLoading }: LifeScoreProps) {
  if (isLoading) {
    return <div className="mb-12 h-96 rounded-2xl bg-slate-100 animate-pulse" />;
  }

  const scores = [
    {
      score: lifeScore.productivity_score,
      label: 'Productivity',
      color: '#10b981',
    },
    {
      score: lifeScore.wellness_score,
      label: 'Wellness',
      color: '#f43f5e',
    },
    {
      score: lifeScore.finance_score,
      label: 'Finance',
      color: '#3b82f6',
    },
    {
      score: lifeScore.growth_score,
      label: 'Growth',
      color: '#f59e0b',
    },
  ];

  const TrendIcon = lifeScore.trend === 'up' ? TrendingUp : lifeScore.trend === 'down' ? TrendingDown : Minus;
  const trendColor = lifeScore.trend === 'up' ? 'text-green-600' : lifeScore.trend === 'down' ? 'text-red-600' : 'text-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 shadow-sm border border-white/80"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Life Score</h2>
          <p className="text-sm text-slate-600">Your comprehensive life metrics</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm"
        >
          <p className="text-3xl font-bold text-indigo-600">{lifeScore.overall_score}</p>
          <div className="flex flex-col items-center">
            <p className="text-xs font-semibold text-slate-600">Overall</p>
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          </div>
        </motion.div>
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4">
        {scores.map((item, index) => (
          <ScoreRing
            key={item.label}
            score={item.score}
            label={item.label}
            color={item.color}
            delay={index * 0.15}
          />
        ))}
      </div>

      {/* Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-8 rounded-lg bg-white/60 px-4 py-3 backdrop-blur-sm border border-white/80"
      >
        <p className="text-sm text-slate-700">
          {lifeScore.trend === 'up'
            ? 'Great momentum! Your life score is improving. Keep up the good work!'
            : lifeScore.trend === 'down'
              ? 'Your score has decreased. Consider focusing on areas that need attention.'
              : "Your score is stable. Look for opportunities to improve your key areas."}
        </p>
      </motion.div>
    </motion.div>
  );
}
