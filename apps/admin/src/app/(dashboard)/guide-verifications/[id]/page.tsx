import { apiFetch } from '@/lib/api';
import { Card } from '@/components/Card';
import { GuideVerificationForm } from '@/components/GuideVerificationForm';

interface GuideVerificationDetail {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry_date: string | null;
  submission_status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  tour_guide_profile: {
    bio: string | null;
    years_experience: number;
  };
}

const statusColors = {
  pending: 'bg-yellow-50 border-yellow-200',
  approved: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
};

const statusBadges = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pending Review' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', icon: '✓', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: '✗', label: 'Rejected' },
};

export default async function GuideVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const verification = await apiFetch<GuideVerificationDetail>(`/admin/guide-verifications/${id}`);

  const statusConfig = statusBadges[verification.submission_status];
  const submittedDate = new Date(verification.submitted_at).toLocaleDateString();
  const reviewedDate = verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleDateString() : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{verification.name}</h1>
          <p className="text-muted mt-1">{verification.email}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.icon} {statusConfig.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column: Application Details */}
        <div className="flex flex-col gap-4">
          {/* Guide Information */}
          <Card className={`border-2 ${statusColors[verification.submission_status]}`}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Guide Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted uppercase">Name</label>
                <p className="text-foreground font-medium">{verification.name}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase">Email</label>
                <p className="text-foreground">{verification.email}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase">Phone</label>
                <p className="text-foreground">{verification.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase">Years of Experience</label>
                <p className="text-foreground">{verification.tour_guide_profile.years_experience} years</p>
              </div>

              {verification.tour_guide_profile.bio && (
                <div>
                  <label className="text-xs font-medium text-muted uppercase">Bio</label>
                  <p className="text-foreground text-sm">{verification.tour_guide_profile.bio}</p>
                </div>
              )}
            </div>
          </Card>

          {/* License Information */}
          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Driver's License</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted uppercase">License Number</label>
                <p className="text-foreground font-mono">{verification.license_number}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted uppercase">Expiry Date</label>
                <p className="text-foreground">
                  {verification.license_expiry_date
                    ? new Date(verification.license_expiry_date).toLocaleDateString()
                    : 'Not provided'}
                </p>
              </div>

              <div className="pt-2 border-t border-border">
                <a
                  href={`/api/admin/guide-verifications/${verification.id}/download-document`}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  📥 Download License File
                </a>
              </div>
            </div>
          </Card>

          {/* Submission Timeline */}
          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
            </div>

            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="text-2xl">📤</div>
                <div>
                  <p className="text-xs text-muted uppercase font-medium">Submitted</p>
                  <p className="text-foreground">{submittedDate}</p>
                </div>
              </div>

              {reviewedDate && (
                <div className="flex gap-4">
                  <div className="text-2xl">👤</div>
                  <div>
                    <p className="text-xs text-muted uppercase font-medium">Reviewed By</p>
                    <p className="text-foreground">{verification.reviewed_by || 'Admin'}</p>
                    <p className="text-xs text-muted">{reviewedDate}</p>
                  </div>
                </div>
              )}

              {verification.rejection_reason && (
                <div className="flex gap-4 bg-red-50 p-3 rounded border border-red-200">
                  <div className="text-2xl">ℹ️</div>
                  <div>
                    <p className="text-xs text-muted uppercase font-medium">Rejection Reason</p>
                    <p className="text-red-900 text-sm">{verification.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Action Form */}
        <div className="flex flex-col gap-4">
          {verification.submission_status === 'pending' ? (
            <GuideVerificationForm verificationId={verification.id} guideName={verification.name} />
          ) : (
            <Card className="bg-surface border-2 border-border">
              <div className="text-center py-8">
                <div className="text-4xl mb-2">
                  {verification.submission_status === 'approved' ? '✅' : '❌'}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {verification.submission_status === 'approved'
                    ? 'Application Approved'
                    : 'Application Rejected'}
                </h3>
                <p className="text-muted text-sm">
                  {verification.submission_status === 'approved'
                    ? 'This guide is now active and can receive bookings.'
                    : 'The guide has been notified of the rejection. They can resubmit their application.'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
