'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
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

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const data = await apiFetch<Restaurant>(`/restaurants/${restaurantId}`);
        setRestaurant(data);
        setImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  const handleImageAdded = (newImage: RestaurantImage) => {
    setImages([...images, newImage]);
  };

  const handleImageDeleted = (imageId: number) => {
    setImages(images.filter((img) => img.id !== imageId));
  };

  const handleImageReordered = async (reorderedImages: RestaurantImage[]) => {
    try {
      await apiFetch('/admin/restaurants/reorder-images', {
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

      <Card className="space-y-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-foreground">Restaurant Information</h2>
          <div className="grid gap-4">
            <div>
              <p className="text-xs font-medium text-muted">Name</p>
              <p className="text-sm text-foreground">{restaurant.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Description</p>
              <p className="text-sm text-foreground">{restaurant.description || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Municipality</p>
              <p className="text-sm text-foreground">{restaurant.municipality}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted">Price Range</p>
                <p className="text-sm text-foreground capitalize">{restaurant.price_range || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Cuisine Tags</p>
                <p className="text-sm text-foreground">
                  {restaurant.cuisine_tags && restaurant.cuisine_tags.length > 0
                    ? restaurant.cuisine_tags.join(', ')
                    : '—'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted">Opening Time</p>
                <p className="text-sm text-foreground">{restaurant.opening_time || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Closing Time</p>
                <p className="text-sm text-foreground">{restaurant.closing_time || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Manager */}
      <ImageManager
        entityType="restaurant"
        entityId={restaurantId}
        images={images}
        onImageAdded={handleImageAdded}
        onImageDeleted={handleImageDeleted}
        onImageReordered={handleImageReordered}
      />
    </div>
  );
}
