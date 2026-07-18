'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/50 bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }}>
          <Link href="/" className="flex items-center gap-2.5 text-lg font-black text-slate-950">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-black text-white shadow-lg shadow-blue-500/30"
            >
              LO
            </motion.div>
            <span>Life OS</span>
          </Link>
        </motion.div>

        {/* Desktop nav */}
        <motion.div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/70 px-2 py-1.5 text-sm font-semibold text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 transition hover:text-slate-950 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-block sm:px-4"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/register"
              className="rounded-full bg-gradient-to-r from-slate-950 to-slate-800 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/30 transition hover:shadow-xl hover:shadow-slate-900/40 hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-4"
        >
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
