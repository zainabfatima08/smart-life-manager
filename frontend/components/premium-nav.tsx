'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  User,
  Settings,
  Trophy,
  Clock,
  Sparkles,
  Home,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/activity', label: 'Activity', icon: Clock },
  { href: '/space', label: 'My Space', icon: Sparkles }
];

export function PremiumNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:overflow-y-auto md:border-r md:border-slate-200 md:bg-white md:shadow-lg">
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-200">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              LO
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Life OS</h1>
              <p className="text-xs text-slate-500">Premium</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto h-2 w-2 rounded-full bg-blue-600"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-4 text-xs text-slate-500 text-center">
            <p>Life OS v2.0</p>
            <p>Premium Experience</p>
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white border-b border-slate-200 shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              LO
            </div>
            <span className="font-bold text-slate-900">Life OS</span>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-slate-200 bg-white px-4 py-3 space-y-2"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2 transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Main Content Offset */}
      <div className="md:ml-64 md:pt-0 pt-20">
        {/* Content goes here via children */}
      </div>
    </>
  );
}

export function PremiumLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PremiumNav />
      <div className="md:ml-64">
        {children}
      </div>
    </>
  );
}
