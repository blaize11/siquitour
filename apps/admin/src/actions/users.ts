'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch } from '@/lib/api';

export async function verifyUser(userId: number): Promise<void> {
  await apiFetch(`/admin/users/${userId}/verify`, { method: 'POST' });
  revalidatePath('/users');
}

export async function setUserStatus(userId: number, status: 'active' | 'suspended'): Promise<void> {
  await apiFetch(`/admin/users/${userId}/status`, { method: 'PUT', body: { status } });
  revalidatePath('/users');
}
