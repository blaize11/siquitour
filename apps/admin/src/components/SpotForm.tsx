'use client';

import { useActionState } from 'react';
import { createSpot } from '@/actions/spots';
import { Button } from './Button';

export function SpotForm() {
  const [state, formAction, pending] = useActionState(createSpot, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input type="radio" name="category" value="spot" defaultChecked /> Spot
        </label>
        <label className="flex items-center gap-1.5 text-sm text-foreground">
          <input type="radio" name="category" value="restaurant" /> Restaurant
        </label>
      </div>
      <input
        name="name"
        placeholder="Name"
        required
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />
      <textarea
        name="description"
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        rows={2}
      />
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Adding…' : 'Add spot'}
      </Button>
    </form>
  );
}
