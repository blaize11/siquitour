import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import type { Paginated } from '@/lib/types';

interface GuideVerification {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  submission_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

const statusBadges = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Rejected' },
};

const filters: { label: string; value: string | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default async function GuideVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const data = await apiFetch<Paginated<GuideVerification>>(
    `/admin/guide-verifications${status ? `?status=${status}` : ''}`
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Guide Verifications</h1>
          <p className="text-sm text-muted mt-1">Review and approve tour guide applications</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/guide-verifications?status=${filter.value}` : '/guide-verifications'}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              status === filter.value
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-foreground hover:bg-border/50'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Verifications Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3 font-medium">Guide Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">License #</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((verification) => {
              const statusConfig = statusBadges[verification.submission_status];
              const submittedDate = new Date(verification.submitted_at).toLocaleDateString();

              return (
                <tr key={verification.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium text-foreground">{verification.name}</td>
                  <td className="px-4 py-3 text-muted text-xs">{verification.email}</td>
                  <td className="px-4 py-3 text-muted font-mono text-xs">{verification.license_number}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{submittedDate}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/guide-verifications/${verification.id}`}
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.data.length === 0 && (
          <p className="p-6 text-center text-sm text-muted">No guide verifications found.</p>
        )}
      </Card>
    </div>
  );
}
