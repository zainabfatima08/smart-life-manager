'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrackerCard } from './tracker-card';

type ChartRow = Record<string, string | number | null>;

export function TrackerLineChart({ data, title, dataKey }: { data: ChartRow[]; title: string; dataKey: string }) {
  return (
    <TrackerCard className="min-h-[280px]">
      <h3 className="mb-4 text-lg font-black text-slate-950">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </TrackerCard>
  );
}

export function TrackerBarChart({ data, title, dataKey }: { data: ChartRow[]; title: string; dataKey: string }) {
  return (
    <TrackerCard className="min-h-[280px]">
      <h3 className="mb-4 text-lg font-black text-slate-950">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
          <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#0f172a" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </TrackerCard>
  );
}
