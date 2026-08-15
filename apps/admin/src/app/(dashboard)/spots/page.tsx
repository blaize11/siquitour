import { apiFetch } from '@/lib/api';
import { deleteSpot } from '@/actions/spots';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SpotForm } from '@/components/SpotForm';
import Link from 'next/link';
import type { Paginated, Spot } from '@/lib/types';

export default async function SpotsPage() {
  const data = await apiFetch<Paginated<Spot>>('/spots');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Spots &amp; Restaurants</h1>

      <Card className="max-w-xl">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Add a spot</h2>
        <SpotForm />
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((spot) => (
              <tr key={spot.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground">{spot.name}</td>
                <td className="px-4 py-3 capitalize text-muted">{spot.category}</td>
                <td className="max-w-xs truncate px-4 py-3 text-muted">{spot.description ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/spots/${spot.id}`}>
                      <Button variant="outline" className="px-2 py-1 text-xs">
                        Manage Images
                      </Button>
                    </Link>
                    <form action={deleteSpot.bind(null, spot.id)}>
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
        {data.data.length === 0 && <p className="p-6 text-center text-sm text-muted">No spots added yet.</p>}
      </Card>
    </div>
  );
}
