import { requireAdmin } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar admin={admin} />
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
