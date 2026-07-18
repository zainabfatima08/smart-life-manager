'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative w-full bg-gradient-to-b from-slate-950 to-slate-900 px-4 py-16 text-slate-400 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="absolute top-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Newsletter signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-blue-500/5 p-8 backdrop-blur sm:p-10"
        >
          <div className="grid gap-6 md:grid-cols-[1fr_300px] md:items-center">
            <div>
              <h3 className="text-2xl font-black text-white">Stay updated</h3>
              <p className="mt-2 text-slate-400">Get tips, features, and updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="rounded-lg bg-cyan-500 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                {subscribed ? '✓' : <ArrowRight size={20} />}
              </motion.button>
            </form>
          </div>
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-8 border-t border-white/10 pt-12 md:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-black text-white shadow-lg"
              >
                LO
              </motion.div>
              <span className="font-black text-white">Life OS</span>
            </div>
            <p className="text-sm leading-6">Mission control for your life.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            <h4 className="mb-4 font-black text-white">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="transition hover:text-cyan-400">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="transition hover:text-cyan-400">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="transition hover:text-cyan-400">
                  How it Works
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="mb-4 font-black text-white">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="transition hover:text-cyan-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-cyan-400">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/forgot-password" className="transition hover:text-cyan-400">
                  Password Help
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h4 className="mb-4 font-black text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="transition hover:text-cyan-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-cyan-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-cyan-400">
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="mb-4 font-black text-white">Connect</h4>
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-400"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
              </motion.a>
              <motion.a
                href="mailto:hello@lifeos.app"
                whileHover={{ scale: 1.1, y: -2 }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-400"
              >
                <Mail size={18} />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm md:flex-row"
        >
          <p>&copy; {currentYear} Life OS. All rights reserved.</p>
          <p className="font-bold text-cyan-400">Build calm. Review often. Improve steadily.</p>
        </motion.div>
      </div>
    </footer>
  );
}
