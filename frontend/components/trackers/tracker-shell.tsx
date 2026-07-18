'use client';

import { motion } from 'motion/react';

export function TrackerShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="cosmic min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.header initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-cyan-600">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
        </motion.header>
        {children}
      </div>
    </main>
  );
}

export function LoadingState() {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/70 p-10 text-center font-black text-slate-600 shadow-xl backdrop-blur">
      Loading tracker data...
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <h3 className="text-xl font-black text-slate-950">No entries yet</h3>
      <p className="mt-2 text-slate-600">{label}</p>
    </div>
  );
}
