'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import {
  Activity,
  Heart,
  Moon,
  Zap,
  TrendingUp,
  Target,
  BookOpen,
} from 'lucide-react';

const tabs = [
  { id: 'habits', label: 'Habits', icon: Activity, color: 'from-blue-500 to-cyan-500' },
  { id: 'mood', label: 'Mood', icon: Heart, color: 'from-rose-500 to-pink-500' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'from-indigo-500 to-blue-500' },
  { id: 'focus', label: 'Focus', icon: Zap, color: 'from-amber-500 to-orange-500' },
  { id: 'expenses', label: 'Expenses', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
  { id: 'goals', label: 'Goals', icon: Target, color: 'from-purple-500 to-pink-500' },
  { id: 'journal', label: 'Journal', icon: BookOpen, color: 'from-slate-500 to-slate-600' },
];

const dashboardContent: Record<string, { items: string[]; stats: { label: string; value: string }[] }> = {
  habits: {
    items: ['Morning meditation', 'Exercise', 'Read 30 mins', 'Journaling'],
    stats: [
      { label: 'This week', value: '18/21' },
      { label: 'Streak', value: '42 days' },
    ],
  },
  mood: {
    items: ['Energized', 'Focused', 'Calm', 'Productive'],
    stats: [
      { label: 'Avg mood', value: '8.2/10' },
      { label: 'Best day', value: 'Tuesday' },
    ],
  },
  sleep: {
    items: ['7h 45m', 'Deep sleep', 'Quality: 92%', 'Consistent rhythm'],
    stats: [
      { label: 'Weekly avg', value: '7h 32m' },
      { label: 'Trend', value: '↑ +12 min' },
    ],
  },
  focus: {
    items: ['Deep work: 4h', 'Meetings: 2h', 'Breaks: 8', 'Distraction blocks: 3'],
    stats: [
      { label: 'Focus score', value: '9.1/10' },
      { label: 'Peak hours', value: '9-11am' },
    ],
  },
  expenses: {
    items: ['Food & dining', 'Transport', 'Subscriptions', 'Personal care'],
    stats: [
      { label: 'This month', value: '$1,240' },
      { label: 'Budget left', value: '$760' },
    ],
  },
  goals: {
    items: ['Ship 5 features', 'Read 2 books', 'Hit fitness goal', 'Learn Spanish'],
    stats: [
      { label: 'Progress', value: '67%' },
      { label: 'On track', value: '3/4 goals' },
    ],
  },
  journal: {
    items: [
      'Reflects on the week ahead',
      'Celebrated small wins',
      'Identified patterns',
      'Set intentions',
    ],
    stats: [
      { label: 'Entries', value: '24' },
      { label: 'Avg length', value: '8 min' },
    ],
  },
};

export function DashboardPreviewSection() {
  const [activeTab, setActiveTab] = useState('habits');
  const activeTabObj = tabs.find((t) => t.id === activeTab)!;
  const Icon = activeTabObj.icon;
  const content = dashboardContent[activeTab];

  return (
    <section className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      {/* Background gradient */}
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-200/20 to-purple-200/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">
            See Life OS in Action
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            Track everything that matters
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Switch between different life areas and see your progress at a glance.
          </p>
        </motion.div>

        {/* Tab buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab, index) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative rounded-full px-4 py-2 font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white shadow-lg'
                    : 'border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TabIcon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>

                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-950 to-slate-800 -z-10"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Dashboard preview card */}
        <motion.div
          layout
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${activeTabObj.color} text-white`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Icon size={24} />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">{activeTabObj.label}</h3>
                    <p className="text-sm text-slate-500">Your weekly dashboard</p>
                  </div>
                </div>
              </div>

              {/* Content grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Items list */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">Current Items</h4>
                  {content.items.map((item, idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ translateX: 8 }}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 hover:bg-blue-50 transition"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                        className="h-2 w-2 rounded-full bg-blue-500"
                      />
                      <span className="font-medium text-slate-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">This Week</h4>
                  {content.stats.map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4"
                    >
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <motion.p
                        className="mt-2 text-3xl font-black text-slate-950"
                        animate={{ scale: [0.95, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {stat.value}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
