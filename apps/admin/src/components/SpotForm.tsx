'use client';

import { useActionState, useState } from 'react';
import { createSpot } from '@/actions/spots';
import { Button } from './Button';
import { LocationPicker } from './LocationPicker';

export function SpotForm() {
  const [state, formAction, pending] = useActionState(createSpot, undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

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

      {/* Location Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Location (optional)</label>
        <LocationPicker onLocationSelect={handleLocationSelect} height={400} />
      </div>

      {/* Hidden fields for coordinates */}
      {latitude !== null && <input type="hidden" name="latitude" value={latitude} />}
      {longitude !== null && <input type="hidden" name="longitude" value={longitude} />}

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Adding…' : 'Add spot'}
      </Button>
    </form>
  );
}
