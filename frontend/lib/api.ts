const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';
export type AuthTokens = { access: string; refresh: string };
export async function api<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the Life OS API at ${API_URL}. Please start the Django backend or update NEXT_PUBLIC_API_URL.`);
    }
    throw error;
  }
}