'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { Card } from './Card';
import { Button } from './Button';

interface GuideVerificationFormProps {
  verificationId: number;
  guideName: string;
}

export function GuideVerificationForm({ verificationId, guideName }: GuideVerificationFormProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    setError(null);
    setSuccess(null);
    setIsApproving(true);

    try {
      await apiFetch(`/admin/guide-verifications/${verificationId}/approve`, {
        method: 'POST',
      });

      setSuccess(`✓ ${guideName}'s verification has been approved!`);
      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(`Failed to approve: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsRejecting(true);

    try {
      await apiFetch(`/admin/guide-verifications/${verificationId}/reject`, {
        method: 'POST',
        body: {
          rejection_reason: rejectionReason.trim(),
        },
      });

      setSuccess(`✓ ${guideName}'s application has been rejected.`);
      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(`Failed to reject: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card className="sticky top-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Admin Actions</h2>
        <p className="text-sm text-muted mt-1">Approve or reject this guide's application</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 rounded bg-green-50 border border-green-200">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Approve Button */}
      <Button
        onClick={handleApprove}
        disabled={isApproving || isRejecting || showRejectForm}
        className="w-full mb-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors"
      >
        {isApproving ? 'Approving...' : '✓ Approve Guide'}
      </Button>

      {/* Reject Section */}
      {!showRejectForm ? (
        <Button
          onClick={() => setShowRejectForm(true)}
          disabled={isApproving || isRejecting}
          variant="danger"
          className="w-full"
        >
          ✗ Reject Application
        </Button>
      ) : (
        <div className="space-y-3 p-4 rounded bg-red-50 border border-red-200">
          <div>
            <label className="text-sm font-medium text-red-900 block mb-2">
              Rejection Reason (required)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this application is being rejected..."
              className="w-full px-3 py-2 border border-red-300 rounded text-sm font-family resize-none"
              rows={4}
              disabled={isRejecting}
            />
            <p className="text-xs text-red-700 mt-1">
              This reason will be shown to the guide. Please be professional and constructive.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {isRejecting ? 'Rejecting...' : 'Send Rejection'}
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false);
                setRejectionReason('');
                setError(null);
              }}
              disabled={isRejecting}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
        💡 Tip: Review the driver's license file before making a decision.
      </p>
    </Card>
  );
}
