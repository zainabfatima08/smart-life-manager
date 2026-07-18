'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

export default function Register() {
  return (
    <main className="auth-page">
      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="auth-card signup-card"
      >
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <p className="auth-eyebrow">Sign up</p>
            <h1 className="auth-title">Create your life manager.</h1>
            <p className="auth-copy">Start with one account for habits, emotions, study, money, goals, reading, and journals.</p>
            <AuthForm mode="register" />
            <p className="auth-switch">
              Already have an account? <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>
        <div className="auth-visual signup-visual">
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
              <p className="auth-visual-kicker">Fresh start</p>
              <h2 className="auth-visual-title">Design the life you can actually track.</h2>
              <p className="auth-visual-copy">Life OS turns daily check-ins into calm insights, future projections, and personal growth momentum.</p>
            </div>
            <div className="auth-checklist">
              <p className="auth-checklist-label">Start Today</p>
              <div className="auth-checklist-items">
                {['Choose core habits', 'Log mood baseline', 'Set first goal'].map((item) => (
                  <div key={item} className="auth-checklist-item"><span className="auth-checklist-dot" />{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}