'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  createTracker,
  deleteTracker,
  listTracker,
  Paginated,
  SleepEntry,
  SleepReport,
  SleepStats,
  todayISO,
  trackerAction,
  trackerEndpoints,
  updateTracker,
} from '@/lib/trackers';

type SleepFormState = {
  slept_on: string;
  duration_minutes: number;
  quality: number;
  bedtime: string;
  wake_time: string;
  note: string;
};

const initialForm: SleepFormState = {
  slept_on: todayISO(),
  duration_minutes: 480,
  quality: 7,
  bedtime: '23:00',
  wake_time: '07:00',
  note: '',
};

function hours(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export default function SleepTrackerPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [calendar, setCalendar] = useState<SleepEntry[]>([]);
  const [report, setReport] = useState<SleepReport | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [form, setForm] = useState<SleepFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Tonight is a system reset. I will help you notice the pattern.');

  async function loadData(filters?: Record<string, string>) {
    const params = Object.fromEntries(Object.entries(filters ?? {}).filter(([, value]) => value));
    const [entryList, sleepStats, sleepCalendar, sleepReport] = await Promise.all([
      listTracker<SleepEntry>(trackerEndpoints.sleep, params),
      trackerAction<SleepStats>(trackerEndpoints.sleep, 'stats'),
      trackerAction<SleepEntry[]>(trackerEndpoints.sleep, 'calendar', params),
      trackerAction<SleepReport>(trackerEndpoints.sleep, 'report', { period }),
    ]);
    return { entryList, sleepStats, sleepCalendar, sleepReport };
  }

  async function refresh(filters = { search, start, end }) {
    setError('');
    const { entryList, sleepStats, sleepCalendar, sleepReport } = await loadData(filters);
    setEntries((entryList as Paginated<SleepEntry>).results ?? []);
    setStats(sleepStats);
    setCalendar(sleepCalendar);
    setReport(sleepReport);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listTracker<SleepEntry>(trackerEndpoints.sleep),
      trackerAction<SleepStats>(trackerEndpoints.sleep, 'stats'),
      trackerAction<SleepEntry[]>(trackerEndpoints.sleep, 'calendar'),
      trackerAction<SleepReport>(trackerEndpoints.sleep, 'report', { period: 'weekly' }),
    ])
      .then(([entryList, sleepStats, sleepCalendar, sleepReport]) => {
        if (!active) return;
        setEntries((entryList as Paginated<SleepEntry>).results ?? []);
        setStats(sleepStats);
        setCalendar(sleepCalendar);
        setReport(sleepReport);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load Sleep Tracker.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    trackerAction<SleepReport>(trackerEndpoints.sleep, 'report', { period })
      .then(setReport)
      .catch(() => undefined);
  }, [period]);

  const chartData = useMemo(
    () =>
      (report?.nights ?? []).map((entry) => ({
        label: new Date(entry.slept_on).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        hours: Number((entry.duration_minutes / 60).toFixed(1)),
        quality: entry.quality,
      })),
    [report],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      bedtime: form.bedtime || null,
      wake_time: form.wake_time || null,
    };
    try {
      if (editingId) {
        await updateTracker<SleepEntry>(trackerEndpoints.sleep, editingId, payload);
        setMessage('Sleep log updated. Your schedule map is sharper now.');
      } else {
        await createTracker<SleepEntry>(trackerEndpoints.sleep, payload);
        setMessage(form.quality >= 8 ? 'That was restorative. Protect what made it possible.' : 'Logged. A small bedtime adjustment can change the whole day.');
      }
      setForm(initialForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save sleep entry.');
    } finally {
      setSaving(false);
    }
  }

  async function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await refresh({ search, start, end });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to filter sleep history.');
    } finally {
      setLoading(false);
    }
  }

  function editEntry(entry: SleepEntry) {
    setEditingId(entry.id);
    setForm({
      slept_on: entry.slept_on,
      duration_minutes: entry.duration_minutes,
      quality: entry.quality,
      bedtime: entry.bedtime ?? '',
      wake_time: entry.wake_time ?? '',
      note: entry.note,
    });
    setMessage('Edit mode is open. Tune the night log with care.');
  }

  async function removeEntry(id: number) {
    try {
      await deleteTracker(trackerEndpoints.sleep, id);
      setMessage('Sleep entry removed from the timeline.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete sleep entry.');
    }
  }

  if (loading && !stats) {
    return (
      <main className="habit-command min-h-screen px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] border border-white/70 bg-white/70 shadow-xl backdrop-blur-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="habit-command min-h-screen overflow-hidden px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-indigo-700">Sleep Lab</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">Design better recovery.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Track duration, quality, bedtimes, wake times, schedule consistency, and recovery trends.
            </p>
          </section>
          <SleepCompanion message={message} quality={form.quality} />
        </motion.header>

        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Weekly Avg" value={hours(stats?.weekly_average_minutes ?? 0)} detail={`${stats?.weekly_average_quality ?? 0}/10 quality`} />
          <MetricCard label="Monthly Avg" value={hours(stats?.monthly_average_minutes ?? 0)} detail={`${stats?.monthly_average_quality ?? 0}/10 quality`} />
          <MetricCard label="Sleep Streak" value={stats?.current_streak ?? 0} detail="Consecutive logged nights" />
          <MetricCard label="Best Night" value={stats?.best_sleep ? `${stats.best_sleep.quality}/10` : '0/10'} detail={stats?.best_sleep ? hours(stats.best_sleep.duration_minutes) : 'Log your first night'} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-700">Night Log</p>
                <h2 className="mt-2 text-2xl font-black">{editingId ? 'Edit Sleep' : 'Log Sleep'}</h2>
              </div>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Sleep date</span>
                  <input className="habit-input" type="date" required value={form.slept_on} onChange={(event) => setForm({ ...form, slept_on: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Duration: {hours(form.duration_minutes)}</span>
                  <input className="habit-input" type="number" min={1} max={1440} required value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })} />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Sleep quality: {form.quality}/10</span>
                <input className="accent-indigo-500" min={1} max={10} type="range" value={form.quality} onChange={(event) => setForm({ ...form, quality: Number(event.target.value) })} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Bed time</span>
                  <input className="habit-input" type="time" value={form.bedtime} onChange={(event) => setForm({ ...form, bedtime: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Wake up time</span>
                  <input className="habit-input" type="time" value={form.wake_time} onChange={(event) => setForm({ ...form, wake_time: event.target.value })} />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Notes</span>
                <textarea className="habit-input min-h-24 resize-none" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Caffeine, screen time, stress, dreams, room temperature..." />
              </label>
              <button disabled={saving} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving sleep...' : editingId ? 'Update sleep' : 'Save sleep'}
              </button>
            </form>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-700">Analytics</p>
                <h2 className="mt-2 text-2xl font-black">Sleep Trends</h2>
              </div>
              <Segmented value={period} onChange={setPeriod} />
            </div>
            {chartData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="sleepArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                    <Area dataKey="hours" type="monotone" stroke="#6366f1" strokeWidth={3} fill="url(#sleepArea)" animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No sleep trend yet" body="Log a night and the recovery graph will start here." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SleepCalendar entries={calendar} />
          <GlassPanel>
            <h2 className="text-2xl font-black">Schedule Timeline</h2>
            <div className="mt-5 grid gap-3">
              {(report?.nights ?? []).slice(-7).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-white/75 p-4 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-slate-700">{new Date(entry.slept_on).toLocaleDateString()}</span>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{entry.quality}/10</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (entry.duration_minutes / 600) * 100)}%` }} className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{entry.bedtime ?? '--:--'} to {entry.wake_time ?? '--:--'} - {hours(entry.duration_minutes)}</p>
                </div>
              ))}
              {!report?.nights.length && <EmptyState title="No timeline yet" body="Your bed and wake schedule appears after logging sleep." />}
            </div>
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <h2 className="text-2xl font-black">Quality Bars</h2>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  <Bar dataKey="quality" fill="#22c55e" radius={[14, 14, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-700">History</p>
              <h2 className="mt-2 text-2xl font-black">Sleep Entries</h2>
            </div>
            <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <input className="habit-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes" />
              <input className="habit-input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
              <input className="habit-input" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5">Filter</button>
            </form>
            <AnimatePresence mode="popLayout">
              {entries.length ? (
                <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
                  {entries.map((entry) => (
                    <SleepRow key={entry.id} entry={entry} onEdit={() => editEntry(entry)} onDelete={() => removeEntry(entry.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No sleep entries" body="Log your first night to begin the recovery dashboard." />
              )}
            </AnimatePresence>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}

function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.28 }} className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-6">
      {children}
    </motion.section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <div className="mt-3 text-4xl font-black text-slate-950">{value}</div>
      <p className="mt-2 text-sm font-semibold text-slate-600">{detail}</p>
    </motion.div>
  );
}

function Segmented({ value, onChange }: { value: 'weekly' | 'monthly'; onChange: (value: 'weekly' | 'monthly') => void }) {
  return (
    <div className="rounded-full bg-white/80 p-1 ring-1 ring-slate-200">
      {(['weekly', 'monthly'] as const).map((option) => (
        <button key={option} onClick={() => onChange(option)} className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${value === option ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>
          {option}
        </button>
      ))}
    </div>
  );
}

function SleepCalendar({ entries }: { entries: SleepEntry[] }) {
  const byDate = new Map(entries.map((entry) => [entry.slept_on, entry]));
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    return { key, date, entry: byDate.get(key), inMonth: date.getMonth() === today.getMonth(), isToday: key === todayISO() };
  });
  return (
    <GlassPanel>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Sleep Calendar</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{entries.length} nights</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[11px] font-black uppercase tracking-wide text-slate-400">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <motion.div key={day.key} whileHover={{ y: -3, scale: 1.02 }} className={`min-h-[76px] rounded-2xl border p-2 ${day.entry ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 shadow-lg shadow-indigo-400/10' : 'border-slate-200 bg-white/70'} ${day.inMonth ? 'opacity-100' : 'opacity-45'} ${day.isToday ? 'ring-2 ring-indigo-300' : ''}`}>
            <div className="flex justify-between text-xs font-black text-slate-500">
              <span>{day.date.getDate()}</span>
              <span>{day.date.getFullYear()}</span>
            </div>
            <div className="mt-2 text-center text-sm font-black text-slate-700">{day.entry ? hours(day.entry.duration_minutes) : '--'}</div>
            <div className="mt-1 truncate text-center text-[11px] font-black text-slate-500">{day.entry ? `${day.entry.quality}/10` : 'No log'}</div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function SleepRow({ entry, onEdit, onDelete }: { entry: SleepEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-lg shadow-slate-900/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-black text-slate-950">{new Date(entry.slept_on).toLocaleDateString()} - {hours(entry.duration_minutes)}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{entry.bedtime ?? '--:--'} to {entry.wake_time ?? '--:--'} - quality {entry.quality}/10</p>
          {entry.note && <p className="mt-3 text-sm leading-6 text-slate-600">{entry.note}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={onEdit} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">Edit</button>
          <button onClick={onDelete} className="rounded-full border border-rose-200 bg-white/80 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50">Delete</button>
        </div>
      </div>
    </motion.article>
  );
}

function SleepCompanion({ message, quality }: { message: string; quality: number }) {
  return (
    <motion.aside initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-indigo-500/10 backdrop-blur-2xl">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto grid h-32 w-32 place-items-center rounded-[36px] border border-indigo-200/40 bg-gradient-to-br from-indigo-100 via-white to-cyan-100 shadow-2xl shadow-indigo-400/15">
        <div className="relative h-20 w-20 rounded-[28px] bg-slate-950">
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.4, repeat: Infinity }} className="absolute left-5 top-6 h-3 w-3 rounded-full bg-indigo-200" />
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.4, repeat: Infinity, delay: 0.12 }} className="absolute right-5 top-6 h-3 w-3 rounded-full bg-indigo-200" />
          <span className={`absolute bottom-5 left-1/2 h-2 w-9 -translate-x-1/2 bg-cyan-300 ${quality >= 7 ? 'rounded-b-full' : 'rounded-full'}`} />
        </div>
      </motion.div>
      <div className="mt-4 rounded-3xl bg-white/80 p-4 text-center ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-700">Recovery Guide</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{message}</p>
      </div>
    </motion.aside>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <div>
        <div className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-gradient-to-br from-indigo-100 via-white to-cyan-100 shadow-xl shadow-indigo-500/10" />
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
