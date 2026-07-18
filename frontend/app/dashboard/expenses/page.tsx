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
  Wallet,
  CreditCard,
  Building2,
  Smartphone,
  MoreHorizontal,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  createTracker,
  deleteTracker,
  ExpenseCategory,
  ExpenseEntry,
  ExpenseStats,
  listTracker,
  Paginated,
  todayISO,
  trackerAction,
  trackerEndpoints,
  updateTracker,
} from '@/lib/trackers';

const initialForm = {
  category: '',
  entry_type: 'expense' as 'income' | 'expense',
  amount: '',
  occurred_on: todayISO(),
  description: '',
  payment_method: 'cash' as 'cash' | 'card' | 'bank' | 'digital' | 'other',
  notes: '',
  is_recurring: false,
  tags: [] as string[],
};

const paymentMethods = [
  { value: 'cash', label: 'Cash', Icon: Wallet },
  { value: 'card', label: 'Card', Icon: CreditCard },
  { value: 'bank', label: 'Bank', Icon: Building2 },
  { value: 'digital', label: 'Digital', Icon: Smartphone },
  { value: 'other', label: 'Other', Icon: MoreHorizontal },
];

const expenseCategoryPresets = [
  { name: 'Food', icon: '🍽️', category_type: 'expense' },
  { name: 'Transport', icon: '🚗', category_type: 'expense' },
  { name: 'Shopping', icon: '🛒', category_type: 'expense' },
  { name: 'Entertainment', icon: '🎭', category_type: 'expense' },
  { name: 'Utilities', icon: '💡', category_type: 'expense' },
  { name: 'Medical', icon: '⚕️', category_type: 'expense' },
];

const incomeCategoryPresets = [
  { name: 'Salary', icon: '💼', category_type: 'income' },
  { name: 'Freelance', icon: '💻', category_type: 'income' },
  { name: 'Investment', icon: '📈', category_type: 'income' },
  { name: 'Bonus', icon: '🎉', category_type: 'income' },
];

const COLORS = ['#fcd34d', '#fbbf24', '#f59e0b', '#f97316', '#ea580c', '#c2410c'];

export default function ExpenseTrackerPage() {
  const [entries, setEntries] = useState<ExpenseEntry[]>([]);
  const [calendar, setCalendar] = useState<ExpenseEntry[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [stats, setStats] = useState<ExpenseStats>({ 
    monthly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, 
    yearly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, 
    by_payment: [], 
    top_categories: [], 
    recent: [] 
  });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [companionMessage, setCompanionMessage] = useState('Welcome back. Track every transaction with intention.');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  async function loadExpenseData(filters = { search, start, end }) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    ) as Record<string, string>;
    try {
      let entryList: Paginated<ExpenseEntry> = { count: 0, next: null, previous: null, results: [] };
      let expenseStats: ExpenseStats = { monthly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, yearly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, by_payment: [], top_categories: [], recent: [] };
      let catList: Paginated<ExpenseCategory> = { count: 0, next: null, previous: null, results: [] };
      
      try {
        entryList = await listTracker<ExpenseEntry>(trackerEndpoints.expenses, params);
      } catch (err) {
      }
      
      try {
        expenseStats = await trackerAction<ExpenseStats>(trackerEndpoints.expenses, 'analytics');
      } catch (err) {
      }
      
      try {
        catList = await listTracker<ExpenseCategory>(trackerEndpoints.expenseCategories);
      } catch (err) {
      }
      
      return { entryList, expenseStats, catList };
    } catch (err) {
      // Return empty data instead of throwing
      return {
        entryList: { count: 0, next: null, previous: null, results: [] },
        expenseStats: { monthly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, yearly: { income: 0, expense: 0, net: 0, savings_rate: 0 }, by_payment: [], top_categories: [], recent: [] },
        catList: { count: 0, next: null, previous: null, results: [] },
      };
    }
  }

  async function refresh(filters = { search, start, end }) {
    setError('');
    try {
      const { entryList, expenseStats, catList } = await loadExpenseData(filters);
      setEntries((entryList as Paginated<ExpenseEntry>).results ?? []);
      setStats(expenseStats);
      setCalendar((entryList as Paginated<ExpenseEntry>).results ?? []);
      setCategories((catList as Paginated<ExpenseCategory>).results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listTracker<ExpenseEntry>(trackerEndpoints.expenses),
      trackerAction<ExpenseStats>(trackerEndpoints.expenses, 'analytics'),
      listTracker<ExpenseCategory>(trackerEndpoints.expenseCategories),
    ])
      .then(([entryList, expenseStats, catList]) => {
        if (!active) return;
        setEntries((entryList as Paginated<ExpenseEntry>).results ?? []);
        setStats(expenseStats);
        setCategories((catList as Paginated<ExpenseCategory>).results ?? []);
        // Set calendar data from entries
        setCalendar((entryList as Paginated<ExpenseEntry>).results ?? []);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load Expense Tracker.');
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
    // Generate chart data from entries grouped by date
    if (!entries.length) return [];
    
    const dataMap = new Map<string, { label: string; income: number; expense: number }>();
    
    entries.forEach((entry) => {
      const date = new Date(entry.occurred_on);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const key = entry.occurred_on;
      
      const existing = dataMap.get(key) || { label, income: 0, expense: 0 };
      const amount = Number(entry.amount);
      
      if (entry.entry_type === 'income') {
        existing.income += amount;
      } else {
        existing.expense += amount;
      }
      
      dataMap.set(key, existing);
    });
    
    // Sort by date key (YYYY-MM-DD format sorts correctly)
    return Array.from(dataMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => value);
  }, [entries]);

  const trendData = useMemo(
    () => chartData.slice(-7), // Show last 7 days/entries
    [chartData],
  );

  function chooseType(type: 'income' | 'expense') {
    setForm({ ...form, entry_type: type });
    setCompanionMessage(type === 'income' ? 'Income logged. Money flowing in.' : 'Expense tracked. Conscious spending.');
  }

  async function createNewCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: newCategoryName,
        category_type: form.entry_type,
        icon: '📁',
        color: 'yellow',
        monthly_budget: 0,
        is_active: true,
      };
      const created = await createTracker<ExpenseCategory>(trackerEndpoints.expenseCategories, payload);
      setNewCategoryName('');
      setShowNewCategory(false);
      await refresh();
      setForm({ ...form, category: created.id.toString() });
      setCompanionMessage('Category created. New financial lens unlocked.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create category';
      
      // Check if it's a duplicate category error
      if (errorMsg.includes('already exists') || errorMsg.includes('UNIQUE constraint')) {
        // Find if we can auto-select the existing category
        const existingCat = categories.find(
          c => c.name.toLowerCase() === newCategoryName.toLowerCase() && 
               c.category_type === form.entry_type
        );
        if (existingCat) {
          setError(`"${newCategoryName}" already exists. Auto-selected it for you.`);
          setForm({ ...form, category: existingCat.id.toString() });
          setNewCategoryName('');
          setShowNewCategory(false);
        } else {
          setError(`"${newCategoryName}" already exists. Try a different name or pick from the dropdown.`);
        }
      } else {
        setError(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await updateTracker<ExpenseEntry>(trackerEndpoints.expenses, editingId, form);
        setCompanionMessage('Transaction updated. Accuracy maintained.');
      } else {
        await createTracker<ExpenseEntry>(trackerEndpoints.expenses, form);
        setCompanionMessage(form.entry_type === 'income' ? 'Income recorded. Keep it flowing.' : 'Expense noted. Spending tracked.');
      }
      setForm(initialForm);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save expense entry.');
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
      setError(err instanceof Error ? err.message : 'Unable to filter expense history.');
    } finally {
      setLoading(false);
    }
  }

  function editEntry(entry: ExpenseEntry) {
    setEditingId(entry.id);
    setForm({
      category: entry.category.toString(),
      entry_type: entry.entry_type,
      amount: entry.amount.toString(),
      occurred_on: entry.occurred_on,
      description: entry.description,
      payment_method: entry.payment_method,
      notes: entry.notes,
      is_recurring: entry.is_recurring,
      tags: entry.tags,
    });
    setCompanionMessage('Edit mode open. Refine the details.');
  }

  async function removeEntry(id: number) {
    setError('');
    try {
      await deleteTracker(trackerEndpoints.expenses, id);
      setCompanionMessage('Entry removed. Records adjusted.');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete expense entry.');
    }
  }

  if (loading && !stats) {
    return (
      <main className="min-h-screen px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-36 animate-pulse rounded-[28px] border border-white/70 bg-white/70 shadow-xl backdrop-blur-xl" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-700">Expense Studio</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-normal text-slate-950 sm:text-6xl">Track every rupee.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Monitor income and expenses with detailed analytics, category breakdowns, and spending patterns.
            </p>
          </section>
          <ExpenseCompanion message={companionMessage} type={form.entry_type} amount={form.amount} />
        </motion.header>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 shadow-md shadow-rose-200/50">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-rose-100 p-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-black text-rose-700">Error</p>
                <p className="mt-1 text-sm font-semibold text-rose-600">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={ArrowUpRight} label="Monthly Income" value={`Rs ${stats.monthly.income.toFixed(2)}`} detail={`${stats.monthly.savings_rate.toFixed(1)}% savings`} color="emerald" />
          <MetricCard icon={ArrowDownLeft} label="Monthly Expense" value={`Rs ${stats.monthly.expense.toFixed(2)}`} detail="This month" color="yellow" />
          <MetricCard icon={TrendingUp} label="Net Savings" value={`Rs ${stats.monthly.net.toFixed(2)}`} detail={stats.monthly.net >= 0 ? 'Positive flow' : 'Deficit'} color={stats.monthly.net >= 0 ? 'emerald' : 'rose'} />
          <MetricCard icon={Wallet} label="Total Transactions" value={entries.length} detail="All entries" color="slate" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">Quick Entry</p>
                <h2 className="mt-2 text-2xl font-black">{editingId ? 'Edit Entry' : 'Log Transaction'}</h2>
              </div>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }} className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={submit} className="grid gap-5">
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  key="income"
                  type="button"
                  whileHover={{ y: -4, scale: 1.03 }}
                  onClick={() => chooseType('income')}
                  className={`rounded-3xl border p-3 text-center transition ${form.entry_type === 'income' ? 'border-yellow-300 bg-yellow-50 shadow-xl shadow-yellow-500/15' : 'border-slate-200 bg-white/70 hover:bg-white'}`}
                >
                  <div className="flex justify-center">
                    <div className={`rounded-full p-2 ${form.entry_type === 'income' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <ArrowUpRight className={`w-6 h-6 ${form.entry_type === 'income' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                  <span className="mt-2 block truncate text-xs font-black text-slate-600">Income</span>
                </motion.button>
                <motion.button
                  key="expense"
                  type="button"
                  whileHover={{ y: -4, scale: 1.03 }}
                  onClick={() => chooseType('expense')}
                  className={`rounded-3xl border p-3 text-center transition ${form.entry_type === 'expense' ? 'border-yellow-300 bg-yellow-50 shadow-xl shadow-yellow-500/15' : 'border-slate-200 bg-white/70 hover:bg-white'}`}
                >
                  <div className="flex justify-center">
                    <div className={`rounded-full p-2 ${form.entry_type === 'expense' ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                      <ArrowDownLeft className={`w-6 h-6 ${form.entry_type === 'expense' ? 'text-yellow-600' : 'text-slate-400'}`} />
                    </div>
                  </div>
                  <span className="mt-2 block truncate text-xs font-black text-slate-600">Expense</span>
                </motion.button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Amount (Rs)</span>
                  <input required className="habit-input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Category</span>
                  <div className="flex gap-2">
                    <select required className="habit-input flex-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.filter(c => c.category_type === form.entry_type || c.category_type === 'both').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setShowNewCategory(true)} className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 px-3 py-3 font-black text-yellow-700 transition hover:bg-yellow-100 hover:border-yellow-400" title="Add new category">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Description</span>
                <input className="habit-input" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="habit-label">Date</span>
                  <input className="habit-input" required type="date" value={form.occurred_on} onChange={(e) => setForm({ ...form, occurred_on: e.target.value })} />
                </label>
                <label className="grid gap-2">
                  <span className="habit-label">Payment Method</span>
                  <select className="habit-input" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as any })}>
                    {paymentMethods.map(pm => (
                      <option key={pm.value} value={pm.value}>{pm.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2">
                <span className="habit-label">Notes (Optional)</span>
                <textarea className="habit-input min-h-28 resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." />
              </label>
              <button disabled={saving} className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-2xl shadow-yellow-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update entry' : 'Save entry'}
              </button>
            </form>

            {showNewCategory && (
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={createNewCategory} className="mt-6 rounded-2xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 p-5 shadow-lg shadow-yellow-200/50">
                <div className="mb-4 flex items-center gap-2">
                  <div className="rounded-full bg-yellow-200 p-2">
                    <Plus className="w-5 h-5 text-yellow-700" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-yellow-900">New Category</h3>
                </div>
                <div className="space-y-4">
                  <label className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-800">Category Name</span>
                    <input 
                      className="rounded-2xl border-2 border-yellow-200 bg-white px-4 py-3 font-semibold text-slate-900 transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-300" 
                      required 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                      placeholder="e.g., Groceries, Rent, Salary..." 
                      autoFocus
                    />
                  </label>
                  
                  <div className="grid gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-yellow-800">Quick Presets</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(form.entry_type === 'income' ? incomeCategoryPresets : expenseCategoryPresets).map((preset) => (
                        <motion.button
                          key={preset.name}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setNewCategoryName(preset.name)}
                          className={`rounded-xl border-2 p-3 text-sm font-black transition ${
                            newCategoryName === preset.name
                              ? 'border-yellow-400 bg-white text-yellow-800 shadow-md shadow-yellow-300/50'
                              : 'border-yellow-200 bg-white/80 text-yellow-700 hover:border-yellow-300 hover:bg-white'
                          }`}
                        >
                          {preset.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button 
                      type="submit" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-yellow-400/30 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50" 
                      disabled={!newCategoryName.trim() || saving}
                    >
                      {saving ? 'Creating...' : 'Create Category'}
                    </motion.button>
                    <motion.button 
                      type="button" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }} 
                      className="flex-1 rounded-2xl border-2 border-yellow-300 bg-white px-4 py-3 text-sm font-black text-yellow-700 transition hover:bg-yellow-50"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.form>
            )}
          </GlassPanel>

          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">Income vs Expense</p>
                <h2 className="mt-2 text-2xl font-black">Trend Analysis</h2>
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
                      <linearGradient id="incomeArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="expenseArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} />
                    <Area dataKey="income" type="monotone" stroke="#10b981" strokeWidth={3} fill="url(#incomeArea)" animationDuration={900} />
                    <Area dataKey="expense" type="monotone" stroke="#f59e0b" strokeWidth={3} fill="url(#expenseArea)" animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No trend yet" body="Log transactions and your income vs expense graph will animate here." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6">
          <ExpenseCalendar entries={calendar} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <GlassPanel>
            <h2 className="text-2xl font-black">Category Breakdown</h2>
            {stats.top_categories.length > 0 ? (
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.top_categories} dataKey="total" innerRadius={48} outerRadius={84} paddingAngle={4} animationDuration={850}>
                      {stats.top_categories.map((entry, index) => {
                        const categoryColors = ['#fcd34d', '#fbbf24', '#f59e0b', '#f97316', '#ea580c', '#c2410c', '#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899', '#f43f5e'];
                        return <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} formatter={(value: any) => `Rs ${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No category data" body="Track expenses or income to see category breakdown." />
            )}
          </GlassPanel>

          <GlassPanel>
            <h2 className="text-2xl font-black">Payment Methods</h2>
            {stats.by_payment.length > 0 ? (
              <div className="mt-5 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.by_payment}>
                    <CartesianGrid stroke="rgba(148,163,184,0.22)" vertical={false} />
                    <XAxis dataKey="payment_method" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid rgba(203,213,225,0.9)', borderRadius: 16, color: '#0f172a' }} formatter={(value: any) => `Rs ${Number(value).toFixed(2)}`} />
                    <Bar dataKey="total" radius={[14, 14, 0, 0]} animationDuration={900}>
                      {stats.by_payment.map((entry, index) => {
                        const paymentColors = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
                        return <Cell key={`cell-${index}`} fill={paymentColors[index % paymentColors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No payment data" body="Add expense entries to see payment method breakdown." />
            )}
          </GlassPanel>
        </section>

        <section className="mt-6">
          <GlassPanel>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">History</p>
                <h2 className="mt-2 text-2xl font-black">Transactions</h2>
              </div>
            </div>
            <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <input className="habit-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search descriptions..." />
              <input className="habit-input" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              <input className="habit-input" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              <button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5">Filter</button>
            </form>
            <AnimatePresence mode="popLayout">
              {entries.length ? (
                <div className="grid max-h-[520px] gap-3 overflow-auto pr-1">
                  {entries.map((entry) => (
                    <ExpenseHistoryRow key={entry.id} entry={entry} onEdit={() => editEntry(entry)} onDelete={() => removeEntry(entry.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No entries found" body="Try a different search or date range, or log your first transaction." />
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

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  detail,
  color = 'slate'
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: string | number; 
  detail: string;
  color?: 'emerald' | 'yellow' | 'rose' | 'slate';
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
  };
  
  const colors = colorMap[color];
  
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} className="rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <div className={`rounded-full ${colors.bg} p-2`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black text-slate-950">{value}</div>
      <p className="mt-2 text-sm font-semibold text-slate-600">{detail}</p>
    </motion.div>
  );
}

function ExpenseCalendar({ entries }: { entries: ExpenseEntry[] }) {
  const byDate = new Map<string, { income: number; expense: number; count: number }>();
  entries.forEach((entry) => {
    const existing = byDate.get(entry.occurred_on) ?? { income: 0, expense: 0, count: 0 };
    const amount = Number(entry.amount);
    byDate.set(entry.occurred_on, {
      income: existing.income + (entry.entry_type === 'income' ? amount : 0),
      expense: existing.expense + (entry.entry_type === 'expense' ? amount : 0),
      count: existing.count + 1,
    });
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
    return { key, date, data: byDate.get(key), inMonth: date.getMonth() === today.getMonth(), isToday: key === todayISO() };
  });

  return (
    <GlassPanel>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Expense Calendar</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-200">{entries.length} entries</span>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-[11px] font-black uppercase tracking-wide text-slate-400">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <motion.div key={day.key} whileHover={{ y: -3, scale: 1.02 }} title={day.data ? `${day.key}: +Rs ${day.data.income.toFixed(2)} -Rs ${day.data.expense.toFixed(2)}` : day.key} className={`min-h-[76px] rounded-2xl border p-2 ${day.data ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-50 shadow-lg shadow-yellow-400/10' : 'border-slate-200 bg-white/70'} ${day.inMonth ? 'opacity-100' : 'opacity-45'} ${day.isToday ? 'ring-2 ring-yellow-300' : ''}`}>
            <div className="flex justify-between text-xs font-black text-slate-500">
              <span>{day.date.getDate()}</span>
              <span>{day.date.getFullYear()}</span>
            </div>
            <div className="mt-2 space-y-1">
              {day.data && (
                <>
                  <div className="text-[10px] font-black text-emerald-600">+Rs {day.data.income.toFixed(0)}</div>
                  <div className="text-[10px] font-black text-yellow-600">-Rs {day.data.expense.toFixed(0)}</div>
                </>
              )}
            </div>
            <div className="mt-1 rounded-full bg-yellow-100 px-2 py-1 text-center text-[10px] font-black text-yellow-700">
              {day.data?.count ?? 0} entry
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}

function ExpenseHistoryRow({ entry, onEdit, onDelete }: { entry: ExpenseEntry; onEdit: () => void; onDelete: () => void }) {
  const isIncome = entry.entry_type === 'income';
  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="rounded-3xl border border-slate-200 bg-white/75 p-4 shadow-lg shadow-slate-900/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${isIncome ? 'bg-emerald-100' : 'bg-yellow-100'}`}>
              {isIncome ? <ArrowUpRight className={`w-5 h-5 text-emerald-600`} /> : <ArrowDownLeft className={`w-5 h-5 text-yellow-600`} />}
            </div>
            <div>
              <h3 className="font-black text-slate-950">{entry.description}</h3>
              <p className="text-sm font-semibold text-slate-500">{entry.category_name} • {new Date(entry.occurred_on).toLocaleDateString()}</p>
            </div>
          </div>
          {entry.notes && <p className="mt-3 text-sm leading-6 text-slate-600">{entry.notes}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <div className={`text-xl font-black ${isIncome ? 'text-emerald-600' : 'text-yellow-600'}`}>
            {isIncome ? '+' : '-'}Rs {Number(entry.amount).toFixed(2)}
          </div>
          <div className="flex gap-2">
            <button onClick={onEdit} className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-white">Edit</button>
            <button onClick={onDelete} className="rounded-full border border-rose-200 bg-white/80 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50">Delete</button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ExpenseCompanion({ message, type, amount }: { message: string; type: string; amount: string }) {
  return (
    <motion.aside initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-2xl shadow-yellow-500/10 backdrop-blur-2xl">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto grid h-32 w-32 place-items-center rounded-[36px] border border-yellow-200/40 bg-gradient-to-br from-yellow-100 via-white to-amber-100 shadow-2xl shadow-yellow-400/15">
        <div className="relative grid h-20 w-20 place-items-center rounded-[28px] bg-slate-950">
          {type === 'income' ? <TrendingUp className="w-10 h-10 text-emerald-400" /> : <TrendingDown className="w-10 h-10 text-yellow-400" />}
        </div>
      </motion.div>
      <div className="mt-4 rounded-3xl bg-white/80 p-4 text-center ring-1 ring-slate-200">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-700">Financial Pulse</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{message}</p>
        {amount && <p className="mt-2 text-lg font-black text-yellow-700">Rs {amount || '0'}</p>}
      </div>
    </motion.aside>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-yellow-100 via-white to-amber-100 text-2xl shadow-xl shadow-yellow-500/10">
          <Wallet className="w-7 h-7 text-yellow-600" />
        </div>
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-600">{body}</p>
      </div>
    </div>
  );
}
