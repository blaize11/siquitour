import { apiFetch } from '@/lib/api';
import { Card } from '@/components/Card';
import { CommissionForm } from '@/components/CommissionForm';
import type { CommissionSetting } from '@/lib/types';

export default async function CommissionPage() {
  const commission = await apiFetch<CommissionSetting>('/admin/commission');

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-foreground">Platform Commission</h1>

      <Card className="max-w-md">
        <p className="mb-4 text-sm text-muted">
          The percentage SiquiTour takes from every completed advance booking. Current rate:{' '}
          <span className="font-semibold text-foreground">{commission.percentage}%</span>
        </p>
        <CommissionForm currentPercentage={commission.percentage} />
      </Card>
    </div>
  );
}
