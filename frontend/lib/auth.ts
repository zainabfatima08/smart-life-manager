'use client';

export const AUTH_STORAGE_KEYS = {
  ACCESS: 'lifeos_access',
  REFRESH: 'lifeos_refresh',
} as const;

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function setTokens(access: string, refresh: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS, access);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH, refresh);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS);
  localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH);
}

export function logout(): void {
  clearTokens();
  // Redirect to the public landing page after logout.
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
