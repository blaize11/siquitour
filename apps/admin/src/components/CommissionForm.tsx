'use client';

import { useActionState } from 'react';
import { updateCommission } from '@/actions/commission';
import { Button } from './Button';

export function CommissionForm({ currentPercentage }: { currentPercentage: string }) {
  const [state, formAction, pending] = useActionState(updateCommission, undefined);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="percentage">
          New percentage
        </label>
        <input
          id="percentage"
          name="percentage"
          type="number"
          step="0.01"
          min={0}
          max={100}
          defaultValue={currentPercentage}
          required
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Saved!</p>}
    </form>
  );
}
