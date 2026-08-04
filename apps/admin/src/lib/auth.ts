import 'server-only';
import { redirect } from 'next/navigation';
import { getSessionToken } from './session';
import { apiFetch } from './api';
import type { User } from './types';

export async function requireAdmin(): Promise<User> {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  let user: User;
  try {
    user = await apiFetch<User>('/me', { token });
  } catch {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/login');
  }

  return user;
}
