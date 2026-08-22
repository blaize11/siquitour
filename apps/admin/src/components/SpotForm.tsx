'use client';

import { useActionState, useState, useRef } from 'react';
import { createSpot } from '@/actions/spots';
import { Button } from './Button';
import { LocationPicker } from './LocationPicker';

export function SpotForm() {
  const [state, formAction, pending] = useActionState(createSpot, undefined);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
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

      {/* Municipality */}
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

      {/* Fee Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fee_type" className="text-sm font-medium text-foreground">
          Fee Type
        </label>
        <select
          id="fee_type"
          name="fee_type"
          defaultValue="free"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="free">Free</option>
          <option value="per_pax">Per Person (₱)</option>
          <option value="donation">Donation</option>
          <option value="consumable">Consumable</option>
        </select>
      </div>

      {/* Fee Amount */}
      <input
        type="number"
        name="fee_amount"
        placeholder="Fee amount (₱)"
        step="0.01"
        min="0"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
      />

      {/* Location Picker */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Location (optional)</label>
        <LocationPicker onLocationSelect={handleLocationSelect} height={400} />
      </div>

      {/* Hidden fields for coordinates */}
      {latitude !== null && <input type="hidden" name="latitude" value={latitude} />}
      {longitude !== null && <input type="hidden" name="longitude" value={longitude} />}

      {/* Image Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Images (optional)</label>
        <div className="rounded-lg border-2 border-dashed border-border p-4">
          <label className="flex cursor-pointer flex-col items-center gap-2">
            <svg
              className="h-8 w-8 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">Click to upload images</span>
            <span className="text-xs text-muted">PNG, JPG, WebP up to 5MB each</span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              disabled={pending}
            />
          </label>
        </div>

        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted">{selectedImages.length} image(s) selected</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative rounded-lg border border-border p-2">
                  <p className="truncate text-xs text-foreground">{file.name}</p>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? 'Creating…' : 'Add Spot'}
      </Button>

      {selectedImages.length > 0 && (
        <p className="text-xs text-muted">💡 After creating the spot, you can upload images on the spot details page</p>
      )}
    </form>
  );
}
