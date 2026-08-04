const roleLabels: Record<string, string> = {
  guest: 'Guest',
  tour_guide: 'Tour Guide',
  renter: 'Renter',
  admin: 'Admin',
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
      {roleLabels[role] ?? role}
    </span>
  );
}

const statusColors: Record<string, string> = {
  active: 'bg-success',
  suspended: 'bg-danger',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-white ${statusColors[status] ?? 'bg-muted'}`}
    >
      {status}
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${verified ? 'bg-success' : 'bg-warning'}`}
    >
      {verified ? 'Verified' : 'Unverified'}
    </span>
  );
}
