'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

export type SpotFormState = { error?: string; spotId?: number } | undefined;

export async function createSpot(_prevState: SpotFormState, formData: FormData): Promise<SpotFormState> {
  const category = String(formData.get('category') ?? 'spot');
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const municipality = String(formData.get('municipality') ?? '').trim();
  const typicalDuration = String(formData.get('typical_duration_minutes') ?? '').trim();
  const latitude = String(formData.get('latitude') ?? '').trim();
  const longitude = String(formData.get('longitude') ?? '').trim();
  const feeType = String(formData.get('fee_type') ?? 'free');
  const feeAmount = String(formData.get('fee_amount') ?? '').trim();

  if (!name) {
    return { error: 'Name is required.' };
  }

  if (!municipality) {
    return { error: 'Municipality is required.' };
  }

  try {
    const response = await apiFetch<{ id: number }>('/admin/spots', {
      method: 'POST',
      body: {
        category,
        name,
        description: description || undefined,
        municipality,
        typical_duration_minutes: typicalDuration ? parseInt(typicalDuration) : 60,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        fee_type: feeType,
        fee_amount: feeAmount ? parseFloat(feeAmount) : undefined,
      },
    });

    revalidatePath('/spots');
    return { spotId: response?.id };
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Unable to add this spot.' };
  }
}

export async function deleteSpot(spotId: number): Promise<void> {
  await apiFetch(`/admin/spots/${spotId}`, { method: 'DELETE' });
  revalidatePath('/spots');
}
