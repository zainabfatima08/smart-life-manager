'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
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
  FocusSession,
  FocusStats,
  FocusTrend,
  listTracker,
  nowLocalInput,
  Paginated,
  postTrackerAction,
  trackerAction,
  trackerEndpoints,
  updateTracker,
} from '@/lib/trackers';
import { Zap, Play, Pause, RotateCcw, Trash2, Edit2, Plus, AlertCircle, Loader } from 'lucide-react';

type FocusFormState = {
  subject: string;
  session_type: 'pomodoro' | 'deep_work' | 'study' | 'review';
  started_at: string;
  duration_minutes: number;
  completed: boolean;
  productivity_rating: number;
  notes: string;
};

const sessionTypes = [
  { value: 'pomodoro', label: 'Pomodoro', color: '#06b6d4', minutes: 25 },
  { value: 'deep_work', label: 'Deep Work', color: '#6366f1', minutes: 90 },
  { value: 'study', label: 'Study', color: '#22c55e', minutes: 45 },
  { value: 'review', label: 'Review', color: '#f59e0b', minutes: 30 },
] as const;

const initialForm: FocusFormState = {
  subject: 'Study Session',
  session_type: 'pomodoro',
  started_at: nowLocalInput(),
  duration_minutes: 25,
  completed: false,
  productivity_rating: 7,
  notes: '',
};

function minutesLabel(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

export default function FocusTrackerPage() {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [stats, setStats] = useState<FocusStats | null>(null);
  const [trends, setTrends] = useState<FocusTrend[]>([]);
  const [calendar, setCalendar] = useState<FocusSession[]>([]);
  const [form, setForm] = useState<FocusFormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(initialForm.duration_minutes * 60);
  const [running, setRunning] = useState(false);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Pick a subject. I will keep the timer steady while you do the brave part.');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function loadData(filters?: Record<string, string>, trendPeriod = period) {
    const params = Object.fromEntries(Object.entries(filters ?? {}).filter(([, value]) => value));
    const [sessionList, focusStats, focusTrends, focusCalendar] = await Promise.all([
      listTracker<FocusSession>(trackerEndpoints.focus, params),
      trackerAction<FocusStats>(trackerEndpoints.focus, 'stats'),
      trackerAction<FocusTrend[]>(trackerEndpoints.focus, 'trends', { period: trendPeriod }),
      trackerAction<FocusSession[]>(trackerEndpoints.focus, 'calendar', params),
    ]);
    return { sessionList, focusStats, focusTrends, focusCalendar };
  }

  async function refresh(filters = { search, start, end }, trendPeriod = period) {
    setError('');
    const { sessionList, focusStats, focusTrends, focusCalendar } = await loadData(filters, trendPeriod);
    setSessions((sessionList as Paginated<FocusSession>).results ?? []);
    setStats(focusStats);
    setTrends(focusTrends);
    setCalendar(focusCalendar);
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listTracker<FocusSession>(trackerEndpoints.focus),
      trackerAction<FocusStats>(trackerEndpoints.focus, 'stats'),
      trackerAction<FocusTrend[]>(trackerEndpoints.focus, 'trends', { period: 'weekly' }),
      trackerAction<FocusSession[]>(trackerEndpoints.focus, 'calendar'),
    ])
      .then(([sessionList, focusStats, focusTrends, focusCalendar]) => {
        if (!active) return;
        setSessions((sessionList as Paginated<FocusSession>).results ?? []);
        setStats(focusStats);
        setTrends(focusTrends);
        setCalendar(focusCalendar);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load Focus Tracker.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setRunning(false);
          void completeActiveSession();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  async function switchPeriod(next: 'weekly' | 'monthly') {
    setPeriod(next);
    try {
      const nextTrends = await trackerAction<FocusTrend[]>(trackerEndpoints.focus, 'trends', { period: next });
      setTrends(nextTrends);
    } catch {
      setError('Unable to load focus trends.');
    }
  }

  const progress = Math.max(0, Math.min(100, ((form.duration_minutes * 60 - remaining) / Math.max(form.duration_minutes * 60, 1)) * 100));
  const ring = 2 * Math.PI * 88;

  const trendData = useMemo(() => {
    // Generate trend data for last 7 days from sessions
    if (!sessions || sessions.length === 0) return [];
    
    const today = new Date();
    const last7Days: Record<string, { minutes: number; sessions: number; productivity: number[] }> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      last7Days[key] = { minutes: 0, sessions: 0, productivity: [] };
    }
    
    // Populate with session data
    sessions.forEach((session) => {
      const sessionDate = new Date(session.started_at);
      const key = sessionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (last7Days[key] && session.completed) {
        last7Days[key].minutes += session.duration_minutes;
        last7Days[key].sessions += 1;
        last7Days[key].productivity.push(session.productivity_rating);
      }
    });
    
    // Convert to array with average productivity
    return Object.entries(last7Days).map(([label, data]) => ({
      label,
      minutes: data.minutes,
      sessions: data.sessions,
      productivity: data.productivity.length > 0 
        ? Number((data.productivity.reduce((a, b) => a + b, 0) / data.productivity.length).toFixed(1))
        : 0,
    }));
  }, [sessions]);

  const subjectData = useMemo(() => stats?.by_subject ?? [], [stats]);

  function chooseType(value: FocusFormState['session_type']) {
    const type = sessionTypes.find((item) => item.value === value);
    if (!type) return;
    setForm({ ...form, session_type: value, duration_minutes: type.minutes });
    if (!running) {
      setRemaining(type.minutes * 60);
    }
    setMessage(`${type.label} mode set. The session is ready when you are.`);
  }

  async function startTimer() {
    setSaving(true);
    setError('');
    try {
      const session = await createTracker<FocusSession>(trackerEndpoints.focus, {
        ...form,
        started_at: new Date().toISOString(),
        completed: false,
      });
      setActiveSessionId(session.id);
      setRemaining(form.duration_minutes * 60);
      setRunning(true);
      setMessage('Timer started. One clean block, one clear target.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start focus session.');
    } finally {
      setSaving(false);
    }
  }

  async function completeActiveSession() {
    if (!activeSessionId) return;
    try {
      await postTrackerAction<FocusSession>(trackerEndpoints.focus, `${activeSessionId}/complete`, {
        completed: true,
        ended_at: new Date().toISOString(),
        productivity_rating: form.productivity_rating,
        notes: form.notes,
      });
      setActiveSessionId(null);
      setMessage('Focus session complete. That counts, and the graph knows it.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete focus session.');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTracker<FocusSession>(trackerEndpoints.focus, editingId, form);
        setMessage('Session updated. Your study log is tidier now.');
        setForm({ ...initialForm, started_at: nowLocalInput() });
        setEditingId(null);
      } else {
        const session = await createTracker<FocusSession>(trackerEndpoints.focus, form);
        
        // If session is not completed, automatically start the timer
        if (!form.completed) {
          setActiveSessionId(session.id);
          setRemaining(form.duration_minutes * 60);
          setRunning(true);
          setMessage('Session started! Focus and do the work.');
        } else {
          setMessage('Completed session logged. Nicely banked.');
          setForm({ ...initialForm, started_at: nowLocalInput() });
        }
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save focus session.');
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
      setError(err instanceof Error ? err.message : 'Unable to filter focus history.');
    } finally {
      setLoading(false);
    }
  }

  function editSession(session: FocusSession) {
    setEditingId(session.id);
    setForm({
      subject: session.subject,
      session_type: session.session_type,
      started_at: session.started_at.slice(0, 16),
      duration_minutes: session.duration_minutes,
      completed: session.completed,
      productivity_rating: session.productivity_rating,
      notes: session.notes,
    });
    if (!running) {
      setRemaining(session.duration_minutes * 60);
    }
    setMessage('Edit mode is open. Adjust the block and keep moving.');
  }

  async function removeSession(id: number) {
    try {
      await deleteTracker(trackerEndpoints.focus, id);
      setMessage('Session removed from focus history.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete focus session.');
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
            <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-700">Focus Studio</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl flex items-center gap-3">
              <Zap className="w-12 h-12 text-emerald-600" />
              Turn attention into evidence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Run Pomodoro blocks, track subjects, protect deep work, and watch your productivity compound.
            </p>
          </section>
          <FocusCompanion message={message} running={running} />
        </motion.header>

        {error && <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Today" value={minutesLabel(stats?.today_minutes ?? 0)} detail="Focused minutes" />
          <MetricCard label="This Week" value={minutesLabel(stats?.weekly_minutes ?? 0)} detail={`${stats?.completed_sessions ?? 0} completed sessions`} />
          <MetricCard label="Focus Streak" value={stats?.current_streak ?? 0} detail="Consecutive focus days" />
          <MetricCard label="Productivity" value={`${stats?.average_productivity ?? 0}/10`} detail="Average rating" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Pomodoro Timer</p>
                <h2 className="mt-2 text-2xl font-black">Focus Block</h2>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{form.session_type.replace('_', ' ')}</span>
            </div>
            <div className="grid place-items-center py-4">
              <div className="relative h-64 w-64">
                <svg className="-rotate-90" height="256" width="256" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="88" stroke="rgba(203,213,225,0.9)" strokeWidth="18" fill="none" />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="88"
                    stroke="#10b981"
                    strokeWidth="18"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={ring}
                    initial={{ strokeDashoffset: ring }}
                    animate={{ strokeDashoffset: ring - (progress / 100) * ring }}
                    transition={{ duration: 0.4 }}
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-5xl font-black text-slate-950">{formatClock(remaining)}</div>
                    <p className="mt-2 text-sm font-black uppercase tracking-[0.2em] text-slate-400">{running ? 'In Focus' : 'Ready'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button disabled={saving || running} onClick={startTimer} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                Start
              </button>
              <button disabled={!running} onClick={() => { setRunning(false); void completeActiveSession(); }} className="rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                Complete
              </button>
            </div>
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Session Builder</p>
                <h2 className="mt-2 text-2xl font-black">{editingId ? 'Edit Session' : 'Plan or Log Session'}</h2>
              </div>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ ...initialForm, started_at: nowLocalInput() }); }} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {sessionTypes.map((type) => (
                  <button key={type.value} type="button" onClick={() => chooseType(type.value)} className={`rounded-2xl border p-3 text-sm font-black transition ${form.session_type === type.value ? 'border-emerald-300 bg-emerald-50 shadow-lg shadow-emerald-500/10' : 'border-slate-200 bg-white/70 hover:bg-white'}`}>
                    {type.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Subject</span>
                  <input className="habit-input" required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Started at</span>
                  <input className="habit-input" required type="datetime-local" value={form.started_at} onChange={(event) => setForm({ ...form, started_at: event.target.value })} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Duration: {minutesLabel(form.duration_minutes)}</span>
                  <input
                    className="habit-input"
                    min={1}
                    max={720}
                    type="number"
                    value={form.duration_minutes}
                    onChange={(event) => {
                      const duration = Number(event.target.value);
                      setForm({ ...form, duration_minutes: duration });
                      if (!running) {
                        setRemaining(duration * 60);
                      }
                    }}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Productivity: {form.productivity_rating}/10</span>
                  <input className="accent-emerald-500" min={1} max={10} type="range" value={form.productivity_rating} onChange={(event) => setForm({ ...form, productivity_rating: Number(event.target.value) })} />
                </label>
              </div>
              <label className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-slate-200">
                <input type="checkbox" checked={form.completed} onChange={(event) => setForm({ ...form, completed: event.target.checked })} className="h-4 w-4 accent-emerald-500" />
                <span className="text-sm font-black text-slate-700">Mark as completed</span>
              </label>
              <label className="grid gap-2">
                <span className="habit-label">Notes</span>
                <textarea className="habit-input min-h-24 resize-none" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Goal, blockers, wins, formulas, chapters, next step..." />
              </label>
              <button disabled={saving} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving session...' : editingId ? 'Update session' : 'Save session'}
              </button>
            </form>
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Productivity Graphs</p>
                <h2 className="mt-2 text-2xl font-black">Focus Trends</h2>
              </div>
              <Segmented value={period} onChange={switchPeriod} />
            </div>
            {trendData.length ? (
              <div className="h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="focusArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                    <Area dataKey="minutes" type="monotone" stroke="#10b981" strokeWidth={3} fill="url(#focusArea)" animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No focus trend yet" body="Complete one session and your productivity graph will wake up." />
            )}
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-2xl font-black">Subject Mix</h2>
            {subjectData.length ? (
              <div className="mt-5 h-80 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectData} dataKey="minutes" innerRadius={58} outerRadius={96} paddingAngle={4} animationDuration={850}>
                      {subjectData.map((entry, index) => (
                        <Cell key={entry.subject} fill={sessionTypes[index % sessionTypes.length].color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No subjects yet" body="Focus sessions will split by subject here." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <FocusCalendar sessions={calendar} />
          <GlassPanel>
            <h2 className="text-2xl font-black">Daily Summary</h2>
            <div className="mt-5 h-72 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.daily ?? []}>
                  <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                  <XAxis dataKey="day" tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                  <Bar dataKey="minutes" fill="#06b6d4" radius={[14, 14, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>
        </section>

        <section className="mt-6">
          <GlassPanel>
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">History</p>
              <h2 className="mt-2 text-2xl font-black">Session History</h2>
            </div>
            <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <input className="habit-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subject or notes" />
              <input className="habit-input" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
              <input className="habit-input" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5">Filter</button>
            </form>
            <AnimatePresence mode="popLayout">
              {sessions.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {sessions.map((session) => (
                    <FocusRow key={session.id} session={session} onEdit={() => editSession(session)} onDelete={() => removeSession(session.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No sessions yet" body="Start a timer or log a study block to build your history." />
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
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.28 }} className="rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl transition-transform duration-300 sm:p-6">
      {children}
    </motion.section>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-transform duration-300">
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

function FocusCalendar({ sessions }: { sessions: FocusSession[] }) {
  const byDate = new Map<string, number>();
  sessions.forEach((session) => {
    const day = session.started_at.slice(0, 10);
    byDate.set(day, (byDate.get(day) ?? 0) + (session.completed ? session.duration_minutes : 0));
  });
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
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const todayMonth = String(todayDate.getMonth() + 1).padStart(2, '0');
    const todayDay = String(todayDate.getDate()).padStart(2, '0');
    const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;
    return { key, date, minutes: byDate.get(key) ?? 0, inMonth: date.getMonth() === today.getMonth(), isToday: key === todayKey };
  });
  return (
    <GlassPanel>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Focus Calendar</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{sessions.length} sessions</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[11px] font-black uppercase tracking-wide text-slate-400">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <motion.div key={day.key} whileHover={{ y: -3, scale: 1.02 }} className={`min-h-[76px] rounded-2xl border p-2 transition-transform duration-300 ${day.minutes ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-lg shadow-emerald-400/10' : 'border-slate-200 bg-white/70'} ${day.inMonth ? 'opacity-100' : 'opacity-45'} ${day.isToday ? 'ring-2 ring-emerald-300' : ''}`}>
            <div className="flex justify-between text-xs font-black text-slate-500">
              <span>{day.date.getDate()}</span>
              <span>{day.date.getFullYear()}</span>
            </div>
            <div className="mt-2 text-center text-sm font-black text-slate-700">{day.minutes ? minutesLabel(day.minutes) : '--'}</div>
            <div className="mt-1 truncate text-center text-[11px] font-black text-slate-500">{day.minutes ? 'focused' : 'No log'}</div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function FocusRow({ session, onEdit, onDelete }: { session: FocusSession; onEdit: () => void; onDelete: () => void }) {
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-lg shadow-slate-900/5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-black text-slate-950">{session.subject}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {session.session_type.replace('_', ' ')} - {minutesLabel(session.duration_minutes)} - {session.productivity_rating}/10
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-400">{new Date(session.started_at).toLocaleString()}</p>
          {session.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{session.notes}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black ${session.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {session.completed ? 'Done' : 'Open'}
        </span>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">Edit</button>
        <button onClick={onDelete} className="rounded-full border border-rose-200 bg-white/80 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50">Delete</button>
      </div>
    </motion.article>
  );
}

function FocusCompanion({ message, running }: { message: string; running: boolean }) {
  return (
    <motion.aside initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl transition-transform duration-300">
      <motion.div animate={{ y: [0, -8, 0], rotate: running ? [0, 1.5, -1.5, 0] : 0 }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto grid h-32 w-32 place-items-center rounded-[36px] border border-emerald-200/40 bg-gradient-to-br from-emerald-100 via-white to-cyan-100 shadow-2xl shadow-emerald-400/15">
        <div className="relative h-20 w-20 rounded-[28px] bg-slate-950">
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute left-5 top-6 h-3 w-3 rounded-full bg-emerald-200" />
          <motion.span animate={{ scaleY: [1, 0.12, 1] }} transition={{ duration: 3.2, repeat: Infinity, delay: 0.12 }} className="absolute right-5 top-6 h-3 w-3 rounded-full bg-emerald-200" />
          <span className="absolute bottom-5 left-1/2 h-2 w-9 -translate-x-1/2 rounded-b-full bg-cyan-300" />
        </div>
      </motion.div>
      <div className="mt-4 rounded-3xl bg-white/80 p-4 text-center ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Focus Companion</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{message}</p>
      </div>
    </motion.aside>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <div>
        <div className="mx-auto mb-4 h-14 w-14 rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-cyan-100 shadow-xl shadow-emerald-500/10" />
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
