'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '@/lib/auth';
import { NotificationBell } from './dashboard/notification-bell';
import { 
  ChevronDown, 
  LayoutGrid, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export function DashboardHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showTrackerDropdown, setShowTrackerDropdown] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  const trackers = [
    { name: 'Habits', href: '/dashboard/habits', icon: 'Sparkles' },
    { name: 'Mood', href: '/dashboard/mood', icon: 'Smile' },
    { name: 'Sleep', href: '/dashboard/sleep', icon: 'Moon' },
    { name: 'Focus', href: '/dashboard/focus', icon: 'Zap' },
    { name: 'Expenses', href: '/dashboard/expenses', icon: 'DollarSign' },
    { name: 'Goals', href: '/dashboard/goals', icon: 'Target' },
    { name: 'Reading', href: '/dashboard/reading', icon: 'BookOpen' },
    { name: 'Journal', href: '/dashboard/journal', icon: 'BookMarked' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-white/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 font-bold text-xl">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
            LO
          </div>
          <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Life OS
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <a href="/dashboard" className="px-3 py-2 text-slate-700 font-semibold transition hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
            Dashboard
          </a>
          
          {/* Trackers Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTrackerDropdown(true)}
              onMouseLeave={() => setShowTrackerDropdown(false)}
              onClick={() => setShowTrackerDropdown(!showTrackerDropdown)}
              className="px-3 py-2 text-slate-700 font-semibold transition hover:text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center gap-1"
            >
              Trackers
              <ChevronDown className={`w-4 h-4 transition-transform ${showTrackerDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showTrackerDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onMouseEnter={() => setShowTrackerDropdown(true)}
                  onMouseLeave={() => setShowTrackerDropdown(false)}
                  className="absolute left-0 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
                >
                  {trackers.map((tracker) => (
                    <a
                      key={tracker.href}
                      href={tracker.href}
                      className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-slate-50 border-b last:border-b-0"
                    >
                      <LayoutGrid className="w-4 h-4 text-slate-400" />
                      {tracker.name}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="/about" className="px-3 py-2 text-slate-700 font-semibold transition hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
            About
          </a>
          
          <a href="/contact" className="px-3 py-2 text-slate-700 font-semibold transition hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
            Contact
          </a>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileNav(!showMobileNav)}
            className="md:hidden rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
          >
            {showMobileNav ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 font-semibold text-indigo-700 transition hover:bg-indigo-200"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-400" />
              <span className="hidden sm:inline">Account</span>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
                >
                  <a
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <a
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 border-t border-slate-200 px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {showMobileNav && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/20 bg-white/90 backdrop-blur-md"
          >
            <nav className="flex flex-col px-6 py-4 space-y-2">
              <a
                href="/dashboard"
                onClick={() => setShowMobileNav(false)}
                className="rounded-lg px-4 py-3 text-slate-700 font-semibold transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                Dashboard
              </a>
              
              {/* Mobile Trackers */}
              <div className="border-t border-slate-200 pt-2 mt-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Trackers</p>
                {trackers.map((tracker) => (
                  <a
                    key={tracker.href}
                    href={tracker.href}
                    onClick={() => setShowMobileNav(false)}
                    className="rounded-lg px-4 py-2 text-slate-700 font-medium transition hover:bg-indigo-50 hover:text-indigo-600 block ml-2"
                  >
                    {tracker.name}
                  </a>
                ))}
              </div>
              
              <a
                href="/about"
                onClick={() => setShowMobileNav(false)}
                className="rounded-lg px-4 py-3 text-slate-700 font-semibold transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                About
              </a>
              
              <a
                href="/contact"
                onClick={() => setShowMobileNav(false)}
                className="rounded-lg px-4 py-3 text-slate-700 font-semibold transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                Contact
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
