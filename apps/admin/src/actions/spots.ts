'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

export type SpotFormState = { error?: string } | undefined;

export async function createSpot(_prevState: SpotFormState, formData: FormData): Promise<SpotFormState> {
  const category = String(formData.get('category') ?? 'spot');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();

  if (!name) {
    return { error: 'Name is required.' };
  }

  try {
    await apiFetch('/admin/spots', {
      method: 'POST',
      body: { category, name, description: description || undefined },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Unable to add this spot.' };
  }

  revalidatePath('/spots');
}

export async function deleteSpot(spotId: number): Promise<void> {
  await apiFetch(`/admin/spots/${spotId}`, { method: 'DELETE' });
  revalidatePath('/spots');
}
