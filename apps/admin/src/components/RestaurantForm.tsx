'use client';

import { useActionState, useState } from 'react';
import { createRestaurant } from '@/actions/restaurants';
import { Button } from './Button';
import { LocationPicker } from './LocationPicker';

export function RestaurantForm() {
  const [state, formAction, pending] = useActionState(createRestaurant, undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="name"
        placeholder="Restaurant Name"
        required
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        rows={2}
      />

      <select
        name="municipality"
        required
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        <option value="">Select Municipality</option>
        <option value="Lazi">Lazi</option>
        <option value="San Juan">San Juan</option>
        <option value="Larena">Larena</option>
        <option value="Maria">Maria</option>
        <option value="Siquijor">Siquijor</option>
        <option value="Enrique Villanueva">Enrique Villanueva</option>
        <option value="San Antonio">San Antonio</option>
      </select>

      <select
        name="price_range"
        defaultValue="mid"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      >
        <option value="budget">Budget</option>
        <option value="mid">Mid-range</option>
        <option value="premium">Premium</option>
      </select>

      <input
        name="cuisine_tags"
        placeholder="Cuisine tags (comma-separated, optional)"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />

      {/* Fee Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fee_type" className="text-sm font-medium text-foreground">
          Fee Type
        </label>
        <select
          id="fee_type"
          name="fee_type"
          defaultValue="consumable"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="free">Free</option>
          <option value="per_pax">Per Person (₱)</option>
          <option value="consumable">Consumable (Min. Spend)</option>
          <option value="donation">Donation</option>
        </select>
      </div>

      {/* Fee Amount */}
      <input
        type="number"
        name="fee_amount"
        placeholder="Fee amount (₱) - optional"
        step="0.01"
        min="0"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />

      <div className="grid grid-cols-2 gap-2">
        <input
          type="time"
          name="opening_time"
          placeholder="Opening time (optional)"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
        <input
          type="time"
          name="closing_time"
          placeholder="Closing time (optional)"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        />
      </div>

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
        {pending ? 'Adding…' : 'Add Restaurant'}
      </Button>
    </form>
  );
}
