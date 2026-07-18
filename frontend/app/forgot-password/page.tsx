'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Star, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api('/auth/forgot-password/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link');
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSubmitted(false);
    setEmail('');
  };

  if (submitted) {
    return (
      <main className="auth-page">
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
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
                <p className="auth-visual-kicker">Password Reset</p>
                <h1 className="auth-visual-title">Check your inbox</h1>
                <p className="auth-visual-copy">If an account exists with that email, we've sent password reset instructions.</p>
              </div>
            </div>
          </div>
          <div className="auth-form-panel">
            <div className="auth-form-inner">
              <div className="auth-success-state">
                <CheckCircle size={64} className="auth-success-icon" />
                <h2 className="auth-success-title">Check your email</h2>
                <p className="auth-success-message">
                  We've sent password reset instructions to <strong>{email}</strong>. 
                  Please check your inbox and spam folder.
                </p>
                <div className="auth-success-actions">
                  <button 
                    onClick={handleTryAgain}
                    className="auth-success-btn auth-success-btn-secondary"
                  >
                    Try another email
                  </button>
                  <Link 
                    href="/login"
                    className="auth-success-btn auth-success-btn-primary"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    );
  }

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
              <p className="auth-visual-kicker">Password Reset</p>
              <h1 className="auth-visual-title">Forgot your password?</h1>
              <p className="auth-visual-copy">No worries. Enter your email and we'll send you reset instructions.</p>
            </div>
          </div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <p className="auth-eyebrow">Reset Password</p>
            <h2 className="auth-title">Get back in</h2>
            <p className="auth-copy">Enter your email address and we'll help you reset your password.</p>
            
            <form onSubmit={handleSubmit} className="auth-form-modern">
              <label className="auth-field">
                <span className="auth-label">Email</span>
                <div className="auth-input-wrapper">
                  <Mail size={20} className="auth-input-icon" />
                  <input 
                    required 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="auth-input auth-input-with-icon"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </label>
              
              {error && (
                <div className="auth-error-box">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              
              <button disabled={loading} type="submit" className="auth-submit">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
            
            <p className="auth-switch">
              Remember your password? <Link href="/login">Log in</Link>
            </p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
