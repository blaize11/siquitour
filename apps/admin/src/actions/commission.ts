'use server';

import { revalidatePath } from 'next/cache';
import { apiFetch, ApiError } from '@/lib/api';

export type CommissionFormState = { error?: string; success?: boolean } | undefined;

export async function updateCommission(
  _prevState: CommissionFormState,
  formData: FormData
): Promise<CommissionFormState> {
  const percentage = Number(formData.get('percentage'));

  if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
    return { error: 'Enter a percentage between 0 and 100.' };
  }

  try {
    await apiFetch('/admin/commission', { method: 'PUT', body: { percentage } });
  } catch (err) {
    return { error: err instanceof ApiError ? err.message : 'Unable to update the commission rate.' };
  }

  revalidatePath('/commission');
  return { success: true };
}
