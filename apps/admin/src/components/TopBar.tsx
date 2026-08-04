import { logout } from '@/actions/auth';
import type { User } from '@/lib/types';

export function TopBar({ admin }: { admin: User }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      <div className="text-sm text-muted">
        Signed in as <span className="font-semibold text-foreground">{admin.name}</span>
      </div>
      <form action={logout}>
        <button type="submit" className="text-sm font-medium text-danger hover:underline">
          Log out
        </button>
      </form>
    </header>
  );
}
