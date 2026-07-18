'use client';

import { motion } from 'motion/react';
import { DashboardInsight } from '@/lib/dashboard';
import * as LucideIcons from 'lucide-react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface InsightsProps {
  insights: DashboardInsight[];
  isLoading?: boolean;
}

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Moon: LucideIcons.Moon,
    TrendingUp: LucideIcons.TrendingUp,
    Wallet: LucideIcons.Wallet,
    BookOpen: LucideIcons.BookOpen,
    Target: LucideIcons.Target,
    PenTool: LucideIcons.PenTool,
    Zap: LucideIcons.Zap,
    Heart: LucideIcons.Heart,
    Star: LucideIcons.Star,
    Flame: LucideIcons.Flame,
    Award: LucideIcons.Award,
    Smile: LucideIcons.Smile,
  };
  return icons[iconName] || Info;
};

const insightVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export function Insights({ insights, isLoading }: InsightsProps) {
  if (isLoading) {
    return (
      <div className="mb-12 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="mb-12 rounded-xl border-2 border-dashed border-slate-200 px-6 py-8 text-center">
        <Info className="mx-auto mb-2 h-8 w-8 text-slate-400" />
        <p className="text-slate-500">No insights available yet. Keep tracking to see insights!</p>
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
      <h2 className="mb-6 text-xl font-bold text-slate-900">Smart Insights</h2>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.icon);
          const isPositive = insight.type === 'positive';
          const isWarning = insight.type === 'warning';

          let bgColor = 'bg-blue-50';
          let borderColor = 'border-blue-200';
          let textColor = 'text-blue-900';
          let iconBg = 'bg-blue-100';
          let iconColor = 'text-blue-600';

          if (isPositive) {
            bgColor = 'bg-green-50';
            borderColor = 'border-green-200';
            textColor = 'text-green-900';
            iconBg = 'bg-green-100';
            iconColor = 'text-green-600';
          } else if (isWarning) {
            bgColor = 'bg-amber-50';
            borderColor = 'border-amber-200';
            textColor = 'text-amber-900';
            iconBg = 'bg-amber-100';
            iconColor = 'text-amber-600';
          }

          return (
            <motion.div
              key={index}
              custom={index}
              variants={insightVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ x: 4 }}
              className={`flex items-start gap-4 rounded-xl ${bgColor} border ${borderColor} p-4 transition-all hover:shadow-md cursor-pointer`}
            >
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className={`mt-1 rounded-lg ${iconBg} p-2 flex-shrink-0`}
              >
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </motion.div>

              <div className="flex-1">
                <p className={`font-semibold ${textColor}`}>{insight.title}</p>
                <p className={`text-sm ${textColor} opacity-80 mt-1`}>{insight.description}</p>
              </div>

              {insight.value && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`ml-4 flex-shrink-0 rounded-lg ${iconBg} px-3 py-1 text-right`}
                >
                  <p className={`font-bold text-lg ${iconColor}`}>{insight.value}</p>
                </motion.div>
              )}

              {isPositive && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-4 top-4"
                >
                  <CheckCircle className={`h-5 w-5 ${iconColor}`} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
