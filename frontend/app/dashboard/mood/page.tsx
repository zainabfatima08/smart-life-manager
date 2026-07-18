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
  listTracker,
  MoodEntry,
  MoodStats,
  Paginated,
  todayISO,
  trackerAction,
  trackerEndpoints,
  updateTracker,
} from '@/lib/trackers';

type MoodFormState = {
  mood: string;
  emoji: string;
  label: string;
  score: number;
  note: string;
  logged_on: string;
};

const moodOptions = [
  { mood: 'great', emoji: '🤩', label: 'Radiant', score: 9, tone: '#22c55e' },
  { mood: 'good', emoji: '🙂', label: 'Steady', score: 7, tone: '#06b6d4' },
  { mood: 'okay', emoji: '😐', label: 'Neutral', score: 5, tone: '#f59e0b' },
  { mood: 'low', emoji: '😔', label: 'Low', score: 3, tone: '#a78bfa' },
  { mood: 'bad', emoji: '😣', label: 'Heavy', score: 1, tone: '#fb7185' },
] as const;

const initialForm: MoodFormState = {
  mood: 'good',
  emoji: '🙂',
  label: 'Steady',
  score: 7,
  note: '',
  logged_on: todayISO(),
};

export default function MoodTrackerPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [calendar, setCalendar] = useState<MoodEntry[]>([]);
  const [form, setForm] = useState<MoodFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [companionMessage, setCompanionMessage] = useState('Welcome back. I am listening for patterns, not perfection.');

  async function loadMoodData(filters = { search, start, end }) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    ) as Record<string, string>;
    const [entryList, moodStats, moodCalendar] = await Promise.all([
      listTracker<MoodEntry>(trackerEndpoints.mood, params),
      trackerAction<MoodStats>(trackerEndpoints.mood, 'stats'),
      trackerAction<MoodEntry[]>(trackerEndpoints.mood, 'calendar', params),
    ]);
    return { entryList, moodStats, moodCalendar };
  }

  async function refresh(filters = { search, start, end }) {
    setError('');
    const { entryList, moodStats, moodCalendar } = await loadMoodData(filters);
    setEntries((entryList as Paginated<MoodEntry>).results ?? []);
    setStats(moodStats);
    setCalendar(moodCalendar);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listTracker<MoodEntry>(trackerEndpoints.mood),
      trackerAction<MoodStats>(trackerEndpoints.mood, 'stats'),
      trackerAction<MoodEntry[]>(trackerEndpoints.mood, 'calendar'),
    ])
      .then(([entryList, moodStats, moodCalendar]) => {
        if (!active) {
          return;
        }
        setEntries((entryList as Paginated<MoodEntry>).results ?? []);
        setStats(moodStats);
        setCalendar(moodCalendar);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load Mood Tracker.');
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

  const chartData = useMemo(() => {
    const rows = period === 'weekly' ? stats?.weekly ?? [] : stats?.monthly ?? [];
    return rows.map((row) => ({
      label: new Date(row.logged_on).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Number(Number(row.avg_score).toFixed(1)),
      entries: row.entries,
    }));
  }, [period, stats]);

  const trendData = useMemo(
    () =>
      (period === 'weekly' ? stats?.weekly ?? [] : stats?.monthly ?? []).map((row) => ({
        label: new Date(row.logged_on).toLocaleDateString(undefined, { weekday: period === 'weekly' ? 'short' : undefined, month: 'short', day: 'numeric' }),
        intensity: Number(Number(row.avg_score).toFixed(1)),
      })),
    [period, stats],
  );

  function chooseMood(option: (typeof moodOptions)[number]) {
    setForm({ ...form, mood: option.mood, emoji: option.emoji, label: option.label, score: option.score });
    setCompanionMessage(`${option.emoji} logged in draft. Give it a note if there is a pattern worth remembering.`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTracker<MoodEntry>(trackerEndpoints.mood, editingId, form);
        setCompanionMessage('Mood entry updated. Your emotional map just got clearer.');
      } else {
        await createTracker<MoodEntry>(trackerEndpoints.mood, form);
        setCompanionMessage(form.score >= 7 ? 'That is a bright signal. Let us remember what helped.' : 'Logged gently. Small care counts on quieter days too.');
      }
      setForm(initialForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save mood entry.');
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
      setError(err instanceof Error ? err.message : 'Unable to filter mood history.');
    } finally {
      setLoading(false);
    }
  }

  function editEntry(entry: MoodEntry) {
    setEditingId(entry.id);
    setForm({
      mood: entry.mood,
      emoji: entry.emoji,
      label: entry.label,
      score: entry.score,
      note: entry.note,
      logged_on: entry.logged_on,
    });
    setCompanionMessage('Edit mode is open. Tune the entry until it feels honest.');
  }

  async function removeEntry(id: number) {
    setError('');
    try {
      await deleteTracker(trackerEndpoints.mood, id);
      setCompanionMessage('Entry removed. Your history stays yours to shape.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete mood entry.');
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
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-700">Mood Studio</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">Track your inner weather.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Log daily moods, spot emotional trends, and pair each signal with the story behind it.
            </p>
          </section>
          <MoodCompanion message={companionMessage} mood={form.emoji} score={form.score} />
        </motion.header>

        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Average Mood" value={stats?.average_score ? `${stats.average_score}/10` : '0/10'} detail="All-time intensity" />
          <MetricCard label="This Week" value={stats?.weekly_average ? `${stats.weekly_average}/10` : '0/10'} detail="Weekly average" />
          <MetricCard label="Mood Streak" value={stats?.current_streak ?? 0} detail="Consecutive logged days" />
          <MetricCard label="Best Signal" value={stats?.best_mood?.emoji ?? '—'} detail={stats?.best_mood ? `${stats.best_mood.label} - ${stats.best_mood.score}/10` : 'Log your first mood'} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Daily Check-in</p>
                <h2 className="mt-2 text-2xl font-black">{editingId ? 'Edit Mood' : 'Log Mood'}</h2>
              </div>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={submit} className="grid gap-5">
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <motion.button
                    key={option.mood}
                    type="button"
                    whileHover={{ y: -4, scale: 1.03 }}
                    onClick={() => chooseMood(option)}
                    className={`rounded-3xl border p-3 text-center transition ${form.mood === option.mood ? 'border-cyan-300 bg-cyan-50 shadow-xl shadow-cyan-500/15' : 'border-slate-200 bg-white/70 hover:bg-white'}`}
                  >
                    <span className="block text-3xl">{option.emoji}</span>
                    <span className="mt-2 block truncate text-xs font-black text-slate-600">{option.label}</span>
                  </motion.button>
                ))}
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Intensity: {form.score}/10</span>
                <input className="accent-cyan-500" min={1} max={10} type="range" value={form.score} onChange={(event) => setForm({ ...form, score: Number(event.target.value) })} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Label</span>
                  <input className="habit-input" required value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Date</span>
                  <input className="habit-input" required type="date" value={form.logged_on} onChange={(event) => setForm({ ...form, logged_on: event.target.value })} />
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Daily notes</span>
                <textarea className="habit-input min-h-28 resize-none" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="What influenced your mood today?" />
              </label>
              <button disabled={saving} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving mood...' : editingId ? 'Update mood' : 'Save mood'}
              </button>
            </form>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Mood Trends</p>
                <h2 className="mt-2 text-2xl font-black">Weekly and Monthly Pulse</h2>
              </div>
              <div className="rounded-full bg-white/80 p-1 ring-1 ring-slate-200">
                {(['weekly', 'monthly'] as const).map((option) => (
                  <button key={option} onClick={() => setPeriod(option)} className={`rounded-full px-4 py-2 text-sm font-black capitalize transition ${period === option ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-950'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {trendData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="moodArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                    <YAxis domain={[0, 10]} stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                    <Area dataKey="intensity" type="monotone" stroke="#06b6d4" strokeWidth={3} fill="url(#moodArea)" animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No trend yet" body="Log a mood and your emotional graph will start animating here." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <MoodCalendar entries={calendar} />
          <GlassPanel>
            <h2 className="text-2xl font-black">Mood Mix</h2>
            {stats?.distribution.length ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.distribution} dataKey="total" innerRadius={48} outerRadius={84} paddingAngle={4} animationDuration={850}>
                        {stats.distribution.map((entry) => (
                          <Cell key={entry.mood} fill={moodOptions.find((option) => option.mood === entry.mood)?.tone ?? '#06b6d4'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid content-center gap-3">
                  {stats.distribution.map((entry) => (
                    <div key={entry.mood} className="flex items-center justify-between rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200">
                      <span className="font-black text-slate-700">{entry.emoji} {entry.label}</span>
                      <span className="text-sm font-black text-slate-500">{entry.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="No mood mix yet" body="Your distribution will appear after your first mood entry." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <h2 className="text-2xl font-black">Entry Volume</h2>
            <div className="mt-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  <Bar dataKey="entries" fill="#34d399" radius={[14, 14, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">History</p>
                <h2 className="mt-2 text-2xl font-black">Mood Entries</h2>
              </div>
            </div>
            <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <input className="habit-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes or labels" />
              <input className="habit-input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
              <input className="habit-input" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5">Filter</button>
            </form>
            <AnimatePresence mode="popLayout">
              {entries.length ? (
                <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
                  {entries.map((entry) => (
                    <MoodHistoryRow key={entry.id} entry={entry} onEdit={() => editEntry(entry)} onDelete={() => removeEntry(entry.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No entries found" body="Try a different search or date range, or log today's mood." />
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

function MoodCalendar({ entries }: { entries: MoodEntry[] }) {
  const byDate = new Map(entries.map((entry) => [entry.logged_on, entry]));
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
          <h2 className="text-2xl font-black">Mood Calendar</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{entries.length} logs</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[11px] font-black uppercase tracking-wide text-slate-400">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <motion.div key={day.key} whileHover={{ y: -3, scale: 1.02 }} title={day.entry ? `${day.key}: ${day.entry.label} ${day.entry.score}/10` : day.key} className={`min-h-[76px] rounded-2xl border p-2 ${day.entry ? 'border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 shadow-lg shadow-cyan-400/10' : 'border-slate-200 bg-white/70'} ${day.inMonth ? 'opacity-100' : 'opacity-45'} ${day.isToday ? 'ring-2 ring-cyan-300' : ''}`}>
            <div className="flex justify-between text-xs font-black text-slate-500">
              <span>{day.date.getDate()}</span>
              <span>{day.date.getFullYear()}</span>
            </div>
            <div className="mt-2 text-center text-2xl">{day.entry?.emoji ?? '·'}</div>
            <div className="mt-1 truncate text-center text-[11px] font-black text-slate-500">{day.entry ? `${day.entry.score}/10` : 'No log'}</div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function MoodHistoryRow({ entry, onEdit, onDelete }: { entry: MoodEntry; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-lg shadow-slate-900/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{entry.emoji}</span>
            <div>
              <h3 className="font-black text-slate-950">{entry.label} <span className="text-sm text-slate-400">({entry.score}/10)</span></h3>
              <p className="text-sm font-semibold text-slate-500">{new Date(entry.logged_on).toLocaleDateString()}</p>
            </div>
          </div>
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

function MoodCompanion({ message, mood, score }: { message: string; mood: string; score: number }) {
  const smile = score >= 7 ? 'rounded-b-full' : score <= 3 ? 'rounded-t-full' : 'rounded-full';
  return (
    <motion.aside initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto grid h-32 w-32 place-items-center rounded-[36px] border border-cyan-200/40 bg-gradient-to-br from-cyan-100 via-white to-emerald-100 shadow-2xl shadow-cyan-400/15">
        <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-slate-950">
          <motion.span animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3.1, repeat: Infinity }} className="absolute left-5 top-6 h-3 w-3 rounded-full bg-cyan-200" />
          <motion.span animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3.1, repeat: Infinity, delay: 0.1 }} className="absolute right-5 top-6 h-3 w-3 rounded-full bg-cyan-200" />
          <span className={`absolute bottom-5 h-2 w-9 bg-emerald-300 ${smile}`} />
        </div>
      </motion.div>
      <div className="mt-4 rounded-3xl bg-white/80 p-4 text-center ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Companion</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{message}</p>
      </div>
    </motion.aside>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-cyan-100 via-white to-emerald-100 text-2xl shadow-xl shadow-cyan-500/10">🙂</div>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
