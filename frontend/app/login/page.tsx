'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

export default function Login() {
  return (
    <main className="auth-page">
      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="auth-card login-card"
      >
        <div className="auth-visual login-visual">
          <div className="auth-orb-large" />
          <div className="auth-orb-small" />
          <div className="auth-visual-content">
            <div className="auth-pill">
              <div className="auth-pill-icon">
                <Star size={20} fill="currentColor" />
              </div>
              Life OS
            </div>
            <div>
              <p className="auth-visual-kicker">Welcome back</p>
              <h1 className="auth-visual-title">Plan your day with clarity.</h1>
              <p className="auth-visual-copy">Log in to sync habits, mood, focus, finances, and personal growth into one calm life dashboard.</p>
            </div>
            <div className="auth-checklist">
              <p className="auth-checklist-label">Mission modules</p>
              <div className="auth-checklist-items">
                {['Habits', 'Mood', 'Goals'].map((item) => (
                  <div key={item} className="auth-checklist-item"><span className="auth-checklist-dot" />{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <p className="auth-eyebrow">Sign in</p>
            <h2 className="auth-title">Continue your Life OS</h2>
            <p className="auth-copy">A beautiful control panel for your real life.</p>
            <AuthForm mode="login" />
            <p className="auth-switch">
              <Link href="/forgot-password">Forgot password?</Link>
              <span className="auth-switch-separator">·</span>
              <Link href="/register">Create account</Link>
            </p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}