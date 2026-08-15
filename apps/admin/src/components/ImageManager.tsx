'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import type { SpotImage, RestaurantImage } from '@/lib/types';

interface ImageManagerProps {
  entityType: 'spot' | 'restaurant';
  entityId: number;
  images: (SpotImage | RestaurantImage)[];
  onImageAdded: (image: SpotImage | RestaurantImage) => void;
  onImageDeleted: (imageId: number) => void;
  onImageReordered: (images: (SpotImage | RestaurantImage)[]) => void;
}

export function ImageManager({
  entityType,
  entityId,
  images,
  onImageAdded,
  onImageDeleted,
  onImageReordered,
}: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/admin/${entityType}s/${entityId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const newImage = await response.json();
      onImageAdded(newImage);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/${entityType}s/${entityId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      onImageDeleted(imageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleDragStart = (imageId: number) => {
    setDraggedImage(imageId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetImageId: number) => {
    if (!draggedImage || draggedImage === targetImageId) return;

    const draggedIndex = images.findIndex((img) => img.id === draggedImage);
    const targetIndex = images.findIndex((img) => img.id === targetImageId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newImages = [...images];
    [newImages[draggedIndex], newImages[targetIndex]] = [newImages[targetIndex], newImages[draggedIndex]];

    // Update sort order
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));

    onImageReordered(reorderedImages);
    setDraggedImage(null);
  };

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">Images</h3>
        <p className="mb-4 text-xs text-muted">Upload and manage images for this {entityType}.</p>
      </div>

      {/* Upload Area */}
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
          <span className="text-sm font-medium text-foreground">Click to upload or drag and drop</span>
          <span className="text-xs text-muted">PNG, JPG, WebP up to 5MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>}

      {isUploading && <div className="text-sm text-muted">Uploading...</div>}

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(image.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(image.id)}
                className={`group relative cursor-move rounded-lg border-2 border-transparent transition-all ${
                  draggedImage === image.id ? 'border-blue-500 opacity-50' : 'border-border hover:border-blue-500'
                }`}
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={image.url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Order Badge */}
                <div className="absolute top-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white">
                  #{index + 1}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-6 text-center">
          <p className="text-sm text-muted">No images uploaded yet.</p>
          <p className="text-xs text-muted">Upload an image to get started.</p>
        </div>
      )}

      <p className="text-xs text-muted">💡 Drag images to reorder them. The order will be used when displaying the {entityType}.</p>
    </Card>
  );
}
