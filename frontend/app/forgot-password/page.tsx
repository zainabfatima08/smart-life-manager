'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function Forgot() {
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
            <div className="auth-pill"><span className="auth-pill-icon">↺</span>Recover</div>
            <div>
              <p className="auth-visual-kicker">Reset access</p>
              <h1 className="auth-visual-title">Get back to your Life OS.</h1>
              <p className="auth-visual-copy">Enter your email and we’ll send a secure reset link so you can continue tracking your life with clarity.</p>
            </div>
            <div className="auth-checklist">
              <p className="auth-checklist-label">Secure flow</p>
              <div className="auth-checklist-items">
                {['Email verification', 'Private reset token', 'Fresh password'].map((item) => (
                  <div key={item} className="auth-checklist-item"><span className="auth-checklist-dot" />{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <p className="auth-eyebrow">Forgot password</p>
            <h2 className="auth-title">Reset your password.</h2>
            <p className="auth-copy">We’ll email you a password reset link if the account exists.</p>
            <form className="auth-form-modern">
              <label className="auth-field">
                <span className="auth-label">Email</span>
                <input type="email" placeholder="you@example.com" className="auth-input" />
              </label>
              <button className="auth-submit">Send reset link</button>
            </form>
            <p className="auth-switch"><Link href="/login">Back to login</Link></p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}