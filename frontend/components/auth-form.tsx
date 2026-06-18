'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type AuthFormProps = {
  mode: 'login' | 'register';
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(e.currentTarget);

    try {
      const path = mode === 'login' ? '/auth/token/' : '/auth/register/';
      const payload = mode === 'login'
        ? { username: form.get('email'), password: form.get('password') }
        : {
            email: form.get('email'),
            username: form.get('email'),
            display_name: form.get('display_name'),
            password: form.get('password'),
          };
      const data: { tokens?: { access: string; refresh: string }; access?: string; refresh?: string } = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const tokens = data.tokens ?? data;
      if (tokens.access && tokens.refresh) {
        localStorage.setItem('lifeos_access', tokens.access);
        localStorage.setItem('lifeos_refresh', tokens.refresh);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form-modern">
      {mode === 'register' && (
        <label className="auth-field">
          <span className="auth-label">Name</span>
          <input name="display_name" placeholder="Your Life OS name" className="auth-input" />
        </label>
      )}
      <label className="auth-field">
        <span className="auth-label">Email</span>
        <input required name="email" type="email" placeholder="you@example.com" className="auth-input" />
      </label>
      <label className="auth-field">
        <span className="auth-label">Password</span>
        <input required name="password" type="password" placeholder="••••••••" className="auth-input" />
      </label>
      {mode === 'register' && (
        <label className="auth-agreement">
          <input required type="checkbox" />
          I agree to build a calmer, more intentional life.
        </label>
      )}
      {error && <p className="auth-error">{error}</p>}
      <button disabled={loading} className="auth-submit">
        {loading ? 'Preparing your dashboard...' : mode === 'login' ? 'Continue to Life OS' : 'Create my Life OS'}
      </button>
    </form>
  );
}