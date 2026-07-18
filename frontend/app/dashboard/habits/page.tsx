'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  createTracker,
  deleteTracker,
  Habit,
  HabitCalendarEntry,
  HabitStats,
  listTracker,
  Paginated,
  postTrackerAction,
  todayISO,
  trackerAction,
  trackerEndpoints,
  updateTracker,
} from '@/lib/trackers';

const categoryLabels: Record<string, string> = {
  health: 'Health',
  study: 'Study',
  work: 'Work',
  fitness: 'Fitness',
  finance: 'Finance',
  wellness: 'Wellness',
  other: 'Other',
};

const colorClasses: Record<string, { chip: string; border: string; glow: string; dot: string; chart: string }> = {
  cyan: {
    chip: 'bg-cyan-100 text-cyan-800 ring-cyan-200',
    border: 'border-cyan-300/30',
    glow: 'shadow-cyan-500/20',
    dot: 'bg-cyan-300',
    chart: '#22d3ee',
  },
  emerald: {
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    border: 'border-emerald-300/30',
    glow: 'shadow-emerald-500/20',
    dot: 'bg-emerald-300',
    chart: '#34d399',
  },
  amber: {
    chip: 'bg-amber-100 text-amber-800 ring-amber-200',
    border: 'border-amber-300/30',
    glow: 'shadow-amber-500/20',
    dot: 'bg-amber-300',
    chart: '#fbbf24',
  },
  rose: {
    chip: 'bg-rose-100 text-rose-800 ring-rose-200',
    border: 'border-rose-300/30',
    glow: 'shadow-rose-500/20',
    dot: 'bg-rose-300',
    chart: '#fb7185',
  },
  violet: {
    chip: 'bg-violet-100 text-violet-800 ring-violet-200',
    border: 'border-violet-300/30',
    glow: 'shadow-violet-500/20',
    dot: 'bg-violet-300',
    chart: '#a78bfa',
  },
};

const palette = Object.keys(colorClasses);

type HabitFormState = {
  name: string;
  category: string;
  description: string;
  target_per_week: number;
  color: string;
  icon: string;
};

const initialForm: HabitFormState = {
  name: '',
  category: 'wellness',
  description: '',
  target_per_week: 5,
  color: 'cyan',
  icon: 'spark',
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState<HabitStats | null>(null);
  const [calendar, setCalendar] = useState<HabitCalendarEntry[]>([]);
  const [form, setForm] = useState<HabitFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reaction, setReaction] = useState('Welcome back. Your habit system is standing by.');

  async function refresh() {
    setError('');
    const [habitList, habitStats, habitCalendar] = await Promise.all([
      listTracker<Habit>(trackerEndpoints.habits, { active: 'true' }),
      trackerAction<HabitStats>(trackerEndpoints.habits, 'stats'),
      trackerAction<HabitCalendarEntry[]>(trackerEndpoints.habits, 'calendar'),
    ]);
    setHabits((habitList as Paginated<Habit>).results ?? []);
    setStats(habitStats);
    setCalendar(habitCalendar);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listTracker<Habit>(trackerEndpoints.habits, { active: 'true' }),
      trackerAction<HabitStats>(trackerEndpoints.habits, 'stats'),
      trackerAction<HabitCalendarEntry[]>(trackerEndpoints.habits, 'calendar'),
    ])
      .then(([habitList, habitStats, habitCalendar]) => {
        if (!active) {
          return;
        }
        setHabits(habitList.results ?? []);
        setStats(habitStats);
        setCalendar(habitCalendar);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load Habit Tracker.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const weeklyChart = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;
        const row = stats?.weekly.find((entry) => entry.completed_on === key);
        return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), completions: row?.count ?? 0 };
      }),
    [stats],
  );

  const categoryChart = useMemo(
    () =>
      (stats?.by_category ?? []).map((entry) => ({
        name: categoryLabels[entry.category] ?? entry.category,
        value: entry.total,
        color: colorClasses[palette[entry.total % palette.length]].chart,
      })),
    [stats],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTracker<Habit>(trackerEndpoints.habits, editingId, form);
        setReaction('Habit protocol updated. Clean trajectory.');
      } else {
        await createTracker<Habit>(trackerEndpoints.habits, form);
        setReaction('New ritual created. Tiny systems, large futures.');
      }
      setForm(initialForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save habit.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleHabit(habit: Habit) {
    const optimistic = habits.map((item) => (item.id === habit.id ? { ...item, completed_today: !item.completed_today } : item));
    setHabits(optimistic);
    setReaction(habit.completed_today ? 'Completion reversed. Course corrected.' : `+20 XP. ${habit.name} is complete.`);
    try {
      await postTrackerAction(trackerEndpoints.habits, 'toggle', { habit: habit.id, completed_on: todayISO() });
      await refresh();
    } catch (err) {
      setHabits(habits);
      setError(err instanceof Error ? err.message : 'Unable to update completion.');
    }
  }

  async function removeHabit(id: number) {
    setError('');
    try {
      await deleteTracker(trackerEndpoints.habits, id);
      setReaction('Habit archived from active orbit.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete habit.');
    }
  }

  function editHabit(habit: Habit) {
    setEditingId(habit.id);
    setForm({
      name: habit.name,
      category: habit.category,
      description: habit.description,
      target_per_week: habit.target_per_week,
      color: habit.color || 'cyan',
      icon: habit.icon || 'spark',
    });
  }

  if (loading) {
    return (
      <main className="habit-command min-h-screen px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-3xl border border-white/70 bg-white/70 backdrop-blur-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="habit-command min-h-screen overflow-hidden px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]"
        >
          <section>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-700">Habit Command</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">
              Build rituals that feel alive.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Complete daily actions, protect streaks, and turn your routines into measurable Life OS progress.
            </p>
          </section>
          <LifeCompanion level={stats?.xp.level ?? 1} message={reaction} celebratory={reaction.includes('+20 XP')} />
        </motion.header>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </motion.div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Today" value={stats?.completed_today ?? 0} detail={`${stats?.xp.daily_xp ?? 0} XP earned`} />
          <MetricCard label="Completion Rate" value={`${stats?.completion_rate ?? 0}%`} detail="Last 30 days" />
          <MetricCard label="Best Streak" value={stats?.top_streaks[0]?.current ?? 0} detail={stats?.top_streaks[0]?.name ?? 'Start one today'} />
          <XPCard stats={stats} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Mission Builder</p>
                <h2 className="mt-2 text-2xl font-black">{editingId ? 'Refine Habit' : 'Create Habit'}</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                  className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
                >
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="habit-label">Habit name</span>
                <input className="habit-input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Morning strength training" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Category</span>
                  <select className="habit-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Weekly target</span>
                  <input
                    className="habit-input"
                    min={1}
                    max={7}
                    required
                    type="number"
                    value={form.target_per_week}
                    onChange={(event) => setForm({ ...form, target_per_week: Number(event.target.value) })}
                  />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Description</span>
                <textarea className="habit-input min-h-24 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What should future you remember about this ritual?" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Signal</span>
                  <select className="habit-input" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })}>
                    <option value="spark">Spark</option>
                    <option value="bolt">Bolt</option>
                    <option value="ring">Ring</option>
                    <option value="star">Star</option>
                  </select>
                </label>
                <div className="grid gap-2">
                  <span className="habit-label">Color</span>
                  <div className="flex flex-wrap gap-2">
                    {palette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Use ${color}`}
                        onClick={() => setForm({ ...form, color })}
                        className={`h-11 w-11 rounded-2xl border transition ${colorClasses[color].dot} ${form.color === color ? 'scale-105 border-white shadow-lg' : 'border-white/60 opacity-80'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button disabled={saving} className="mt-2 rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving habit...' : editingId ? 'Update habit' : 'Launch habit'}
              </button>
            </form>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Daily Console</p>
                <h2 className="mt-2 text-2xl font-black">Today&apos;s Habits</h2>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">{habits.length} active</span>
            </div>
            <AnimatePresence mode="popLayout">
              {habits.length === 0 ? (
                <EmptyHabitState />
              ) : (
                <div className="grid gap-3">
                  {habits.map((habit) => (
                    <HabitRow key={habit.id} habit={habit} onToggle={() => toggleHabit(habit)} onEdit={() => editHabit(habit)} onDelete={() => removeHabit(habit.id)} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <GlassPanel>
            <h2 className="text-2xl font-black">Habit Pulse</h2>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChart}>
                  <defs>
                    <linearGradient id="habitArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  <Area dataKey="completions" type="monotone" stroke="#22d3ee" strokeWidth={3} fill="url(#habitArea)" animationDuration={900} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-2xl font-black">Category Mix</h2>
            {categoryChart.length ? (
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryChart} innerRadius={58} outerRadius={96} dataKey="value" paddingAngle={4} animationDuration={900}>
                      {categoryChart.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmptyState title="No categories yet" description="Launch your first habit and this panel will split your routines by life area." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <HabitHeatmap entries={calendar} />
          <GlassPanel>
            <h2 className="text-2xl font-black">Streak Leaders</h2>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.top_streaks ?? []} layout="vertical">
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" horizontal={false} />
                  <XAxis allowDecimals={false} type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={120} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  <Bar dataKey="current" radius={[0, 14, 14, 0]} animationDuration={900}>
                    {(stats?.top_streaks ?? []).map((entry) => (
                      <Cell key={entry.id} fill={colorClasses[entry.color]?.chart ?? '#22d3ee'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </section>
      </div>
    </main>
  );
}

function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.28 }}
      className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl sm:p-6"
    >
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

function XPCard({ stats }: { stats: HabitStats | null }) {
  const xp = stats?.xp;
  const progress = xp ? Math.min(100, (xp.level_progress / xp.level_target) * 100) : 0;
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-[24px] border border-cyan-100 bg-white/70 p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Life Level</p>
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">Lv {xp?.level ?? 1}</span>
      </div>
      <div className="mt-3 text-4xl font-black text-slate-950">{xp?.total_xp ?? 0} XP</div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200/80">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200" />
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-600">{xp?.weekly_xp ?? 0} XP this week</p>
    </motion.div>
  );
}

function HabitRow({ habit, onToggle, onEdit, onDelete }: { habit: Habit; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const tone = colorClasses[habit.color] ?? colorClasses.cyan;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`rounded-3xl border ${tone.border} bg-white/75 p-4 shadow-xl ${tone.glow}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onToggle} className="flex min-w-0 items-center gap-4 text-left">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-1 ${tone.chip}`}>
            <span className={`h-3 w-3 rounded-full ${tone.dot}`} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black text-slate-950">{habit.name}</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">
              {categoryLabels[habit.category] ?? habit.category} - {habit.current_streak} day streak - best {habit.longest_streak}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={onToggle} className={`rounded-full px-4 py-2 text-sm font-black transition ${habit.completed_today ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/20' : 'bg-slate-950 text-white hover:bg-slate-800'}`}>
            {habit.completed_today ? 'Done' : '+20 XP'}
          </button>
          <button onClick={onEdit} className="rounded-full border border-slate-200 bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">
            Edit
          </button>
          <button onClick={onDelete} className="rounded-full border border-rose-200 bg-white/70 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50">
            Delete
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function HabitHeatmap({ entries }: { entries: HabitCalendarEntry[] }) {
  const byDate = new Map<string, number>();
  entries.forEach((entry) => byDate.set(entry.completed_on, (byDate.get(entry.completed_on) ?? 0) + 1));
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const formatter = new Intl.DateTimeFormat(undefined, { month: 'short' });
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(today);
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;
    return {
      key,
      count: byDate.get(key) ?? 0,
      date,
      inMonth: date.getMonth() === today.getMonth(),
      isToday: key === todayKey,
    };
  });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <GlassPanel>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Completion Calendar</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{monthLabel}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
          {entries.length} completions
        </span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-[11px] font-black uppercase tracking-wide text-slate-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <motion.div
            key={day.key}
            title={`${day.key}: ${day.count} completions`}
            whileHover={{ y: -3, scale: 1.02 }}
            className={`min-h-[76px] rounded-2xl border p-2 transition ${
              day.count
                ? 'border-cyan-200 bg-gradient-to-br from-cyan-100 via-white to-emerald-100 shadow-lg shadow-cyan-400/15'
                : 'border-slate-200 bg-white/70'
            } ${day.inMonth ? 'opacity-100' : 'opacity-45'} ${day.isToday ? 'ring-2 ring-cyan-300' : ''}`}
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <div className="text-base font-black leading-none text-slate-950">{day.date.getDate()}</div>
                <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{formatter.format(day.date)}</div>
              </div>
              <div className="text-[10px] font-black text-slate-400">{day.date.getFullYear()}</div>
            </div>
            <div className={`mt-3 rounded-full px-2 py-1 text-center text-[11px] font-black ${day.count ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {day.count} done
            </div>
          </motion.div>
        ))}
      </div>
      {!entries.length && (
        <p className="mt-4 rounded-2xl bg-white/70 p-4 text-sm font-semibold leading-6 text-slate-600 ring-1 ring-slate-200">
          Complete a habit once and this calendar will start lighting up with your progress history.
        </p>
      )}
    </GlassPanel>
  );
}

function LifeCompanion({ level, message, celebratory }: { level: number; message: string; celebratory: boolean }) {
  return (
    <motion.aside
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mx-auto grid h-28 w-28 place-items-center rounded-[32px] border border-cyan-200/30 bg-gradient-to-br from-cyan-200 via-slate-100 to-emerald-200 shadow-2xl shadow-cyan-400/20"
      >
        <div className="relative h-16 w-16 rounded-3xl bg-slate-950">
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute left-4 top-5 h-3 w-3 rounded-full bg-cyan-200" />
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.08 }} className="absolute right-4 top-5 h-3 w-3 rounded-full bg-cyan-200" />
          <span className="absolute bottom-4 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-emerald-300" />
        </div>
      </motion.div>
      <AnimatePresence>
        {celebratory && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0">
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ x: '50%', y: '50%', opacity: 1 }}
                animate={{ x: `${15 + index * 8}%`, y: `${18 + (index % 4) * 16}%`, opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute h-2 w-2 rounded-full bg-amber-200"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Life Companion - Lv {level}</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{message}</p>
      </div>
    </motion.aside>
  );
}

function EmptyHabitState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <h3 className="text-xl font-black text-slate-950">No active habits yet</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">Create your first daily ritual and the command deck will start tracking streaks, XP, and trends.</p>
    </motion.div>
  );
}

function ChartEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 grid h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center"
    >
      <div>
        <div className="mx-auto mb-4 h-16 w-16 rounded-3xl bg-gradient-to-br from-cyan-100 via-white to-emerald-100 shadow-xl shadow-cyan-500/10" />
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}
