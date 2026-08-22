import { apiFetch } from '@/lib/api';
import { deleteRestaurant } from '@/actions/restaurants';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { RestaurantForm } from '@/components/RestaurantForm';
import type { Paginated, Restaurant } from '@/lib/types';
import Link from 'next/link';

export default async function RestaurantsPage() {
  const data = await apiFetch<Paginated<Restaurant>>('/restaurants');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Restaurants</h1>

      <Card className="max-w-xl">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Add a restaurant</h2>
        <RestaurantForm />
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Municipality</th>
              <th className="px-4 py-3 font-medium">Cuisine</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((restaurant) => (
              <tr key={restaurant.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{restaurant.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{restaurant.municipality}</td>
                <td className="px-4 py-3 text-muted">
                  {restaurant.cuisine_tags ? restaurant.cuisine_tags.join(', ') : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/restaurants/${restaurant.id}`}>
                      <Button variant="outline" className="px-2 py-1 text-xs">
                        Edit Restaurant
                      </Button>
                    </Link>
                    <form action={deleteRestaurant.bind(null, restaurant.id)}>
                      <Button type="submit" variant="danger" className="px-2 py-1 text-xs">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.data.length === 0 && <p className="p-6 text-center text-sm text-muted">No restaurants added yet.</p>}
      </Card>
    </div>
  );
}
