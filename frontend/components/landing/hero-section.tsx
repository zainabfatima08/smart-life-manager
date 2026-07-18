'use client';

import Link from 'next/link';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mounted, setMounted] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { width, height } = e.currentTarget.getBoundingClientRect();
    mouseX.set(clientX - width / 2);
    mouseY.set(clientY - height / 2);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { value: '92%', label: 'weekly clarity', icon: '📊' },
    { value: '18', label: 'habits tracked', icon: '✓' },
    { value: '4.8x', label: 'better focus', icon: '⚡' },
  ];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="life-gradient relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8 lg:pt-32"
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-300/20 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-300/20 blur-3xl"
        />
      </div>

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.94fr_1.06fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-gradient-to-r from-white/90 to-blue-50/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            Plan your day, track your growth
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="max-w-3xl text-5xl font-black leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl"
          >
            Your Life OS for a calmer, clearer week.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
          >
            Track habits, goals, mood, focus, and money in one polished dashboard built for daily momentum.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-slate-950 to-slate-800 px-8 py-4 text-base font-black text-white shadow-xl shadow-slate-900/30 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/40"
              >
                Start Free Trial
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 bg-white/80 px-8 py-4 text-base font-black text-slate-900 shadow-sm transition hover:-translate-y-1 hover:border-slate-400 hover:bg-white hover:shadow-md backdrop-blur-sm"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated statistics */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4"
          >
            {stats.map(({ value, label }, index) => (
              <motion.div
                key={label}
                whileHover={{ translateY: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
                className="rounded-2xl border border-white/80 bg-gradient-to-br from-white/80 to-blue-50/80 p-4 shadow-sm backdrop-blur transition"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className="text-3xl font-black text-slate-950"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {value}
                  </motion.div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview with glow */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.18 }}
          className="relative"
        >
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl"
          />

          <motion.div
            whileHover={{ scale: 1.02, rotateX: 5 }}
            className="relative rounded-[2rem] border border-white/90 bg-white/75 p-3 shadow-2xl shadow-slate-900/20 backdrop-blur"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-auto text-xs font-bold uppercase tracking-widest text-slate-400">Today</span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-[0.9fr_1.1fr]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl bg-white p-5 text-slate-950"
                >
                  <div className="text-sm font-bold text-slate-500">Life Score</div>
                  <div className="mt-3 flex items-end gap-3">
                    <motion.div
                      animate={{ scale: [0.8, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-6xl font-black leading-none"
                    >
                      84
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
                    >
                      +12%
                    </motion.div>
                  </div>
                  <div className="mt-6 grid grid-cols-7 items-end gap-2">
                    {[44, 64, 48, 78, 68, 86, 74].map((height, index) => (
                      <motion.span
                        key={index}
                        animate={{ height: [height - 10, height, height - 5] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.1,
                        }}
                        className="rounded-full bg-slate-950"
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                </motion.div>

                <div className="grid gap-4">
                  {[
                    ['Deep Work', '2h 40m', 'bg-blue-500'],
                    ['Morning Run', 'Done', 'bg-emerald-500'],
                    ['Budget Review', '68%', 'bg-amber-500'],
                  ].map(([title, value, color], idx) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.05, translateX: 5 }}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white backdrop-blur transition"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${color}`} />
                          <span className="font-bold">{title}</span>
                        </div>
                        <span className="text-sm font-black text-slate-200">{value}</span>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 p-5 text-slate-950 transition"
                  >
                    <div className="text-sm font-black uppercase tracking-wide opacity-70">Next Focus</div>
                    <div className="mt-2 text-2xl font-black">Ship the weekly plan</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

