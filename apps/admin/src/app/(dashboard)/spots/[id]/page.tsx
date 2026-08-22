'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { clientApiFetch } from '@/lib/client-api';
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
  const [saving, setSaving] = useState(false);
  const [editedSpot, setEditedSpot] = useState<Partial<Spot>>({});

  useEffect(() => {
    const loadSpot = async () => {
      try {
        const data = await clientApiFetch<Spot>(`/spots/${spotId}`);
        setSpot(data);
        setImages(data.images || []);
        setEditedSpot({
          name: data.name,
          description: data.description,
          fee_type: data.fee_type,
          fee_amount: data.fee_amount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spot');
      } finally {
        setLoading(false);
      }
    };

    loadSpot();
  }, [spotId]);

  const handleSaveChanges = async () => {
    if (!spot) return;
    setSaving(true);
    try {
      await clientApiFetch(`/admin/spots/${spotId}`, {
        method: 'PUT',
        body: editedSpot,
      });
      setSpot({ ...spot, ...editedSpot });
      setError(null);
      alert('Spot updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update spot');
    } finally {
      setSaving(false);
    }
  };

  const handleImageAdded = (newImage: SpotImage) => {
    setImages([...images, newImage]);
  };

  const handleImageDeleted = (imageId: number) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleImageReordered = async (reorderedImages: SpotImage[]) => {
    try {
      await clientApiFetch('/admin/spots/reorder-images', {
        method: 'PUT',
        body: {
          images: reorderedImages.map((img) => ({
            id: img.id,
            sort_order: img.sort_order,
          })),
        },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Edit Spot Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-medium text-muted">Name</label>
              <input
                type="text"
                value={editedSpot.name || ''}
                onChange={(e) => setEditedSpot({ ...editedSpot, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Category</label>
              <p className="text-sm text-foreground mt-1 p-2 bg-surface rounded">{spot.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Description</label>
              <textarea
                value={editedSpot.description || ''}
                onChange={(e) => setEditedSpot({ ...editedSpot, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Municipality</label>
              <p className="text-sm text-foreground mt-1 p-2 bg-surface rounded">{spot.municipality}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted">Fee Type</label>
                <select
                  value={editedSpot.fee_type || 'free'}
                  onChange={(e) => setEditedSpot({ ...editedSpot, fee_type: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                >
                  <option value="free">Free</option>
                  <option value="per_pax">Per Person (₱)</option>
                  <option value="donation">Donation</option>
                  <option value="consumable">Consumable</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Fee Amount (₱)</label>
                <input
                  type="number"
                  value={editedSpot.fee_amount || ''}
                  onChange={(e) => setEditedSpot({ ...editedSpot, fee_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="self-start"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        </Card>

        {/* Image Manager Card */}
        <Card className="space-y-4">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-foreground">Images</h2>
            <ImageManager
              entityType="spot"
              entityId={spotId}
              images={images}
              onImageAdded={handleImageAdded}
              onImageDeleted={handleImageDeleted}
              onImageReordered={handleImageReordered}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
