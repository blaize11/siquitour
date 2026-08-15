'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

export type RestaurantFormState = { error?: string } | undefined;

export async function createRestaurant(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const municipality = String(formData.get('municipality') ?? '').trim();
  const price_range = String(formData.get('price_range') ?? '').trim();
  const cuisine_tags = String(formData.get('cuisine_tags') ?? '')
    .trim()
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag);
  const latitude = String(formData.get('latitude') ?? '').trim();
  const longitude = String(formData.get('longitude') ?? '').trim();
  const opening_time = String(formData.get('opening_time') ?? '').trim();
  const closing_time = String(formData.get('closing_time') ?? '').trim();

  if (!name) {
    return { error: 'Name is required.' };
  }

  if (!municipality) {
    return { error: 'Municipality is required.' };
  }

  try {
    await apiFetch('/admin/restaurants', {
      method: 'POST',
      body: {
        name,
        description: description || undefined,
        municipality,
        price_range: price_range || undefined,
        cuisine_tags: cuisine_tags.length > 0 ? cuisine_tags : undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        opening_time: opening_time || undefined,
        closing_time: closing_time || undefined,
      },
    });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Unable to add this restaurant.' };
  }

  revalidatePath('/restaurants');
}

export async function deleteRestaurant(id: number) {
  try {
    await apiFetch(`/admin/restaurants/${id}`, {
      method: 'DELETE',
    });
    revalidatePath('/restaurants');
  } catch (error) {
    console.error('Failed to delete restaurant:', error);
    throw error;
  }
}
