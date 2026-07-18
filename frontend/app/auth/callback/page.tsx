'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Handle user cancellation or error
        if (error) {
          setError(`OAuth error: ${error}`);
          setLoading(false);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Handle missing code
        if (!code) {
          setError('No authorization code received');
          setLoading(false);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        // Determine provider from state or default to github
        const provider = state === 'google' ? 'google' : 'github';

        // Exchange code for tokens
        const endpoint = provider === 'google' ? '/auth/google/' : '/auth/github/';
        const redirectUri = `${window.location.origin}/auth/callback`;
        
        const payload = provider === 'google' 
          ? { code, redirect_uri: redirectUri }
          : { code };

        const data = await api(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        if (data.tokens && data.tokens.access && data.tokens.refresh) {
          // Store tokens
          localStorage.setItem('lifeos_access', data.tokens.access);
          localStorage.setItem('lifeos_refresh', data.tokens.refresh);

          // Try to get user profile for additional info
          try {
            const profileData = await api('/auth/profile/', { method: 'GET' });
            if (profileData && profileData.email) {
              localStorage.setItem('userEmail', profileData.email);
              const nameOnly = profileData.display_name || profileData.email.split('@')[0];
              localStorage.setItem('userName', nameOnly);
              if (profileData.created_at) {
                const joinDate = profileData.created_at.split('T')[0];
                localStorage.setItem('userJoinDate', joinDate);
              }
            }
          } catch (err) {
            // Profile fetch failed, but we have valid tokens, redirect to dashboard
            console.error('Profile fetch failed:', err);
          }

          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          setError('Invalid response from OAuth provider');
          setLoading(false);
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'OAuth authentication failed';
        setError(errorMsg);
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        {loading ? (
          <>
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            </div>
            <p className="text-slate-600">Completing authentication...</p>
          </>
        ) : error ? (
          <>
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-slate-600">Redirecting to login...</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
