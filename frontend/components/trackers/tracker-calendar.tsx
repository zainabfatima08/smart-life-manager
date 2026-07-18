'use client';

import { TrackerCard } from './tracker-card';

export type CalendarPoint = {
  date: string;
  label?: string;
  value?: number;
};

export function TrackerCalendar({ points, title }: { points: CalendarPoint[]; title: string }) {
  const byDate = new Map(points.map((point) => [point.date, point]));
  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, point: byDate.get(key) };
  });

  return (
    <TrackerCard>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">35 days</span>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map(({ key, point }) => (
          <div
            key={key}
            title={`${key}${point?.label ? ` - ${point.label}` : ''}`}
            className={`aspect-square rounded-xl border ${
              point ? 'border-cyan-300 bg-cyan-400 shadow-lg shadow-cyan-400/20' : 'border-slate-200 bg-white/70'
            }`}
          />
        ))}
      </div>
    </TrackerCard>
  );
}
