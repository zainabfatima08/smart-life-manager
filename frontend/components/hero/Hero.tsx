'use client';

import { motion } from 'motion/react';
import { AnimatedBackground } from '@/components/hero/AnimatedBackground';
import { Button } from '@/components/hero/Button';
import { FloatingShapes } from '@/components/hero/FloatingShapes';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.16 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <AnimatedBackground />
      <FloatingShapes />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/55 px-6 py-10 text-center shadow-2xl shadow-slate-300/50 backdrop-blur-2xl sm:px-10 sm:py-14 lg:px-16 lg:py-16"
      >
        <motion.div variants={item} className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500 shadow-lg shadow-slate-200/70">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
          Life Manager OS
        </motion.div>

        <motion.h1 variants={item} className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
          Turn your daily life into a beautiful, trackable system.
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
          Life OS connects habits, moods, goals, focus, money, sleep and reflection into one calm dashboard so you can see patterns and grow with intention.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button>Start your life dashboard</Button>
          <Button variant="secondary">View product tour</Button>
        </motion.div>

        <motion.div variants={item} className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
          {['Habits', 'Mood', 'Focus', 'Money'].map((metric) => (
            <div key={metric} className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Track</p>
              <p className="mt-2 text-lg font-black text-slate-900">{metric}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}