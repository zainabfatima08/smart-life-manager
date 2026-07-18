'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function TrackerCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl', className)}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ label, value, tone = 'slate' }: { label: string; value: string | number; tone?: string }) {
  return (
    <TrackerCard className="p-4">
      <div className={`text-2xl font-black text-${tone}-950`}>{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">{label}</div>
    </TrackerCard>
  );
}
