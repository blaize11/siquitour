import 'server-only';
import { redirect } from 'next/navigation';
import { getSessionToken } from './session';

const API_BASE_URL = process.env.API_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Explicit token override — used during login (before the cookie exists) and logout. */
  token?: string | null;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const token = options.token !== undefined ? options.token : await getSessionToken();

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    // A previously-valid session went stale (revoked token, expired, etc). Layout-level
    // auth checks don't re-run on client-side navigation between sibling pages under the
    // same layout, so this is the actual place that needs to catch it — everywhere,
    // automatically. Only applies when we *had* a token; a 401 on the login call itself
    // (token: null) just means "wrong credentials" and should surface normally.
    if (response.status === 401 && token) {
      redirect('/login');
    }

    throw new ApiError(
      response.status,
      payload?.message ?? response.statusText ?? 'Request failed',
      payload?.errors
    );
  }

  return payload as T;
}
