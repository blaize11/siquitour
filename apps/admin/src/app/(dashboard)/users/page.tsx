import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { verifyUser, setUserStatus } from '@/actions/users';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { RoleBadge, StatusBadge, VerifiedBadge } from '@/components/Badge';
import type { Paginated, Role, User } from '@/lib/types';

const filters: { label: string; value: Role | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Guests', value: 'guest' },
  { label: 'Tour Guides', value: 'tour_guide' },
  { label: 'Renters', value: 'renter' },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const data = await apiFetch<Paginated<User>>(`/admin/users${role ? `?role=${role}` : ''}`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Users</h1>
        <div className="flex gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.value ? `/users?role=${filter.value}` : '/users'}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                role === filter.value
                  ? 'bg-primary text-white'
                  : 'border border-border bg-surface text-foreground hover:bg-border/50'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Verification</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((user) => {
              const profile = user.tour_guide_profile ?? user.renter_profile;
              const canVerify = Boolean(profile) && !profile?.is_verified;

              return (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3">
                    {profile && <VerifiedBadge verified={profile.is_verified} />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canVerify && (
                        <form action={verifyUser.bind(null, user.id)}>
                          <Button type="submit" variant="secondary" className="px-2 py-1 text-xs">
                            Verify
                          </Button>
                        </form>
                      )}
                      {user.role !== 'admin' && (
                        <form
                          action={setUserStatus.bind(
                            null,
                            user.id,
                            user.status === 'active' ? 'suspended' : 'active'
                          )}
                        >
                          <Button
                            type="submit"
                            variant={user.status === 'active' ? 'danger' : 'secondary'}
                            className="px-2 py-1 text-xs"
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.data.length === 0 && <p className="p-6 text-center text-sm text-muted">No users found.</p>}
      </Card>
    </div>
  );
}
