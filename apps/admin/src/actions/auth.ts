'use server';

import { redirect } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { setSessionToken, clearSessionToken, getSessionToken } from '@/lib/session';
import type { User } from '@/lib/types';

export type LoginState = { error?: string } | undefined;

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Enter your email and password.' };
  }

  let result: { user: User; token: string };
  try {
    result = await apiFetch<{ user: User; token: string }>('/login', {
      method: 'POST',
      body: { email, password },
      token: null,
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Unable to log in.' };
  }

  if (result.user.role !== 'admin') {
    await apiFetch('/logout', { method: 'POST', token: result.token }).catch(() => {});
    return { error: 'This account does not have admin access.' };
  }

  await setSessionToken(result.token);
  redirect('/users');
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await apiFetch('/logout', { method: 'POST', token }).catch(() => {});
  }
  await clearSessionToken();
  redirect('/login');
}
