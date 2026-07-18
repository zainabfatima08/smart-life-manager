import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function api(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  // Add Content-Type if not present
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Add auth token if available
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (err) {
    console.error('Fetch failed:', err);
    throw new Error(`Failed to connect to ${url}: ${err instanceof Error ? err.message : 'Network error'}`);
  }

  // Handle token expiry
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // Try to refresh the token
        const refreshResponse = await fetch(`${API_BASE}/auth/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.access;
          
          if (newAccessToken) {
            setTokens(newAccessToken, refreshToken);
            
            // Retry original request with new token
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(url, { ...options, headers });
          }
        } else {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch (err) {
        clearTokens();
        throw err;
      }
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorData = await response.json();
      errorDetail = errorData.error || errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch {
      // Response not JSON
    }
    throw new Error(`API Error: ${response.status} ${errorDetail}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function apiWithAuth(endpoint: string, options: RequestInit = {}) {
  if (!getAccessToken()) {
    throw new Error('Not authenticated');
  }
  return api(endpoint, options);
}
