'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { clientApiFetch } from '@/lib/client-api';
import { Card } from '@/components/Card';
import { ImageManager } from '@/components/ImageManager';
import { Button } from '@/components/Button';
import type { Restaurant, RestaurantImage } from '@/lib/types';

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = parseInt(params.id as string, 10);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [images, setImages] = useState<RestaurantImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState<Partial<Restaurant>>({});

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await clientApiFetch<Restaurant>(`/restaurants/${restaurantId}`);
        setRestaurant(data);
        setImages(data.images || []);
        setEditedRestaurant({
          name: data.name,
          description: data.description,
          price_range: data.price_range,
          fee_type: data.fee_type,
          fee_amount: data.fee_amount,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  const handleSaveChanges = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      await clientApiFetch(`/admin/restaurants/${restaurantId}`, {
        method: 'PUT',
        body: editedRestaurant,
      });
      setRestaurant({ ...restaurant, ...editedRestaurant });
      setError(null);
      alert('Restaurant updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  const handleImageAdded = (newImage: RestaurantImage) => {
    setImages([...images, newImage]);
  };

  const handleImageDeleted = (imageId: number) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleImageReordered = async (reorderedImages: RestaurantImage[]) => {
    try {
      await clientApiFetch('/admin/restaurants/reorder-images', {
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

  if (error || !restaurant) {
    return <div className="text-center text-red-600">{error || 'Restaurant not found'}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{restaurant.name}</h1>
          <p className="text-sm text-muted">{restaurant.municipality}</p>
        </div>
        <Button
          onClick={() => router.push('/restaurants')}
          variant="outline"
          className="text-xs"
        >
          ← Back to Restaurants
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
        <div>
          <h2 className="mb-4 text-sm font-semibold text-foreground">Edit Restaurant Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="text-xs font-medium text-muted">Name</label>
              <input
                type="text"
                value={editedRestaurant.name || ''}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Description</label>
              <textarea
                value={editedRestaurant.description || ''}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, description: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Municipality</label>
              <p className="text-sm text-foreground mt-1 p-2 bg-surface rounded">{restaurant.municipality}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted">Price Range</label>
                <select
                  value={editedRestaurant.price_range || 'mid'}
                  onChange={(e) => setEditedRestaurant({ ...editedRestaurant, price_range: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                >
                  <option value="budget">Budget</option>
                  <option value="mid">Mid-range</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted">Fee Type</label>
                <select
                  value={editedRestaurant.fee_type || 'free'}
                  onChange={(e) => setEditedRestaurant({ ...editedRestaurant, fee_type: e.target.value as any })}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                >
                  <option value="free">Free</option>
                  <option value="per_pax">Per Person (₱)</option>
                  <option value="consumable">Consumable (Min. Spend)</option>
                  <option value="donation">Donation</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Fee Amount (₱) - Optional</label>
              <input
                type="number"
                value={editedRestaurant.fee_amount || ''}
                onChange={(e) => setEditedRestaurant({ ...editedRestaurant, fee_amount: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground mt-1"
                step="0.01"
                min="0"
              />
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
              entityType="restaurant"
              entityId={restaurantId}
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
