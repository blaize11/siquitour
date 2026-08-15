'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/Card';
import { ImageManager } from '@/components/ImageManager';
import { Button } from '@/components/Button';
import type { Spot, SpotImage } from '@/lib/types';

export default function SpotDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const spotId = parseInt(params.id as string, 10);

  const [spot, setSpot] = useState<Spot | null>(null);
  const [images, setImages] = useState<SpotImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpot = async () => {
      try {
        const data = await apiFetch<Spot>(`/spots/${spotId}`);
        setSpot(data);
        setImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spot');
      } finally {
        setLoading(false);
      }
    };

    loadSpot();
  }, [spotId]);

  const handleImageAdded = (newImage: SpotImage) => {
    setImages([...images, newImage]);
  };

  const handleImageDeleted = (imageId: number) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleImageReordered = async (reorderedImages: SpotImage[]) => {
    try {
      await apiFetch('/admin/spots/reorder-images', {
        method: 'PUT',
        body: JSON.stringify({
          images: reorderedImages.map((img) => ({
            id: img.id,
            sort_order: img.sort_order,
          })),
        }),
      });
      setImages(reorderedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder images');
    }
  };

  if (loading) {
    return <div className="text-center text-muted">Loading...</div>;
  }

  if (error || !spot) {
    return <div className="text-center text-red-600">{error || 'Spot not found'}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{spot.name}</h1>
          <p className="text-sm text-muted">{spot.category}</p>
        </div>
        <Button
          onClick={() => router.push('/spots')}
          variant="outline"
          className="text-xs"
        >
          ← Back to Spots
        </Button>
      </div>

      <Card className="space-y-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Spot Information</h2>
          <div className="grid gap-4">
            <div>
              <p className="text-xs font-medium text-muted">Name</p>
              <p className="text-sm text-foreground">{spot.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Category</p>
              <p className="text-sm text-foreground">{spot.category}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Description</p>
              <p className="text-sm text-foreground">{spot.description || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Municipality</p>
              <p className="text-sm text-foreground">{spot.municipality}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted">Fee Type</p>
                <p className="text-sm text-foreground">{spot.fee_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Fee Amount</p>
                <p className="text-sm text-foreground">₱{spot.fee_amount || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Manager */}
      <ImageManager
        entityType="spot"
        entityId={spotId}
        images={images}
        onImageAdded={handleImageAdded}
        onImageDeleted={handleImageDeleted}
        onImageReordered={handleImageReordered}
      />
    </div>
  );
}
