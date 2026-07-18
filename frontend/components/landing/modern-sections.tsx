'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import {
  BarChart3,
  Target,
  Check,
  Heart,
  TrendingDown,
  Shield,
  ChevronDown,
} from 'lucide-react';

const features = [
  {
    icon: 'analytics',
    title: 'Life Score Analytics',
    description: 'See focus, wellness, money, and habit signals in one clean daily score.',
    color: 'from-blue-500/20 to-cyan-500/20',
    icon_color: 'text-blue-600',
  },
  {
    icon: 'goal',
    title: 'Goal Roadmaps',
    description: 'Turn big goals into weekly milestones and tiny daily actions.',
    color: 'from-purple-500/20 to-pink-500/20',
    icon_color: 'text-purple-600',
  },
  {
    icon: 'habit',
    title: 'Habit Rhythm',
    description: 'Track streaks without clutter and spot the routines that move your life forward.',
    color: 'from-emerald-500/20 to-teal-500/20',
    icon_color: 'text-emerald-600',
  },
  {
    icon: 'mood',
    title: 'Mood & Energy',
    description: 'Log how you feel and connect your mood with sleep, work, and habits.',
    color: 'from-rose-500/20 to-pink-500/20',
    icon_color: 'text-rose-600',
  },
  {
    icon: 'finance',
    title: 'Money Check-ins',
    description: 'Keep budgets, reviews, and spending reminders beside the rest of your life.',
    color: 'from-amber-500/20 to-orange-500/20',
    icon_color: 'text-amber-600',
  },
  {
    icon: 'privacy',
    title: 'Private Workspace',
    description: 'A focused personal dashboard with secure auth and a calm interface.',
    color: 'from-indigo-500/20 to-blue-500/20',
    icon_color: 'text-indigo-600',
  },
];

const steps = [
  ['01', 'Capture', 'Add goals, habits, mood, and money checkpoints in minutes.'],
  ['02', 'Prioritize', 'Life OS turns your inputs into the next few actions that matter.'],
  ['03', 'Improve', 'Review progress weekly and keep the routines that actually work.'],
];

const faqs = [
  {
    question: 'How does Life OS help me build better habits?',
    answer:
      'Life OS tracks your daily habits and shows you patterns over time. The streak system keeps you motivated, and insights help you understand which habits actually impact your life score.',
  },
  {
    question: 'Can I use Life OS on mobile?',
    answer:
      'Yes! Life OS is fully responsive and works beautifully on mobile. You can check your daily score, log activities, and update your goals on any device.',
  },
  {
    question: 'Is my data private and secure?',
    answer:
      'Absolutely. Your data is encrypted end-to-end and stored securely. We never share your personal information with third parties. You have full control.',
  },
  {
    question: 'What if I miss a day on a habit?',
    answer:
      'Life OS is forgiving. You can log past days, and the streak continues if you get back on track. The goal is progress, not perfection.',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes, you can export all your data as JSON or CSV anytime. Life OS is built on your data ownership principles.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! Start free and explore all features. Upgrade anytime if you need advanced analytics or premium integrations.',
  },
];

export function ModernSections() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <>
      <section id="features" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Life OS dashboard"
            title="Everything feels connected, not scattered."
            copy="A clean personal command center for the parts of life that usually live in different apps."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                whileHover={{
                  translateY: -8,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                }}
                className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-8 shadow-lg backdrop-blur transition overflow-hidden"
              >
                {/* Glow on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition duration-300`}
                  initial={false}
                />

                <div className="relative">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.icon_color} text-xl`}
                  >
                    {getFeatureIcon(feature.icon)}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-20 text-white sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-300">How it works</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              Build a system you can actually use every day.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Life OS keeps the flow simple: capture the important things, choose the right next move, then review what changed.
            </p>
          </div>

          <div className="grid gap-4">
            {steps.map(([number, title, copy], idx) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                whileHover={{
                  translateX: 8,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                }}
                className="group relative grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-blue-500/10 p-6 backdrop-blur transition overflow-hidden"
              >
                {/* Glow on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition duration-300"
                  initial={false}
                />

                <div className="relative sm:grid sm:grid-cols-[72px_1fr] sm:gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="mb-4 inline-grid h-16 w-16 place-items-center rounded-2xl bg-white text-xl font-black text-slate-950 sm:mb-0"
                  >
                    {number}
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-2 leading-7 text-slate-300">{copy}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="relative bg-gradient-to-b from-white via-blue-50/50 to-white px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient blob */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr from-emerald-200/20 to-cyan-200/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10 sm:p-10 border border-slate-200/50"
            >
              <p className="text-sm font-black uppercase tracking-[0.28em] text-emerald-600">Made for momentum</p>
              <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                Start with a focused dashboard, grow into your full Life OS.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {['Daily planning', 'Goal tracking', 'Habit insights'].map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ translateY: -4 }}
                    className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-bold text-slate-700 flex items-center gap-2 transition"
                  >
                    <Check size={18} className="text-emerald-600 flex-shrink-0" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white shadow-2xl shadow-slate-900/30 border border-white/10 relative overflow-hidden"
            >
              {/* Badge */}
              <motion.div
                animate={{ rotate: -3 }}
                className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black rotate-12"
              >
                Most Popular
              </motion.div>

              <div className="text-sm font-bold text-slate-400">Starter Plan</div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-5xl font-black">Free</span>
                <span className="pb-2 text-slate-400">to try</span>
              </div>
              <p className="mt-4 leading-7 text-slate-300">
                Create your account and bring habits, goals, mood, focus, and finances into one view.
              </p>

              {/* Features list */}
              <div className="mt-8 space-y-3 mb-8">
                {['Unlimited trackers', 'Weekly insights', 'Mobile & desktop', 'Secure & private'].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="flex items-center justify-center rounded-full bg-white px-6 py-3 font-black text-slate-950 shadow-lg shadow-white/20 transition hover:bg-cyan-100 w-full"
                >
                  Get Started →
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative bg-white px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
          }}
          className="absolute top-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">Questions?</p>
            <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Find answers to common questions about Life OS.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <motion.button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-5 text-left transition hover:border-slate-300 hover:shadow-md"
                  whileHover={{ translateX: 4 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-black text-slate-950">{faq.question}</h3>
                    <motion.div
                      animate={{
                        rotate: activeFaq === idx ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={20} className="text-slate-600 flex-shrink-0" />
                    </motion.div>
                  </div>
                </motion.button>

                {activeFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-b-xl border-l border-r border-b border-slate-200 bg-blue-50/50 p-5"
                  >
                    <p className="text-slate-600 leading-7">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl"
    >
      <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-slate-600">{copy}</p>
    </motion.div>
  );
}

function getFeatureIcon(name: string) {
  const iconClass = 'h-6 w-6';
  const icons: Record<string, React.ReactNode> = {
    analytics: (
      <BarChart3 className={iconClass} />
    ),
    goal: (
      <Target className={iconClass} />
    ),
    habit: (
      <Check className={iconClass} />
    ),
    mood: (
      <Heart className={iconClass} />
    ),
    finance: (
      <TrendingDown className={iconClass} />
    ),
    privacy: (
      <Shield className={iconClass} />
    ),
  };

  return icons[name] || null;
}
