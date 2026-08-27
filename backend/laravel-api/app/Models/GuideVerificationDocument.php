<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'driver_license_front_file_path',
    'driver_license_back_file_path',
    'license_number',
    'license_expiry_date',
    'submission_status',
    'submitted_at',
    'reviewed_at',
    'reviewed_by',
    'rejection_reason',
    'rejection_date',
    'notes',
])]
class GuideVerificationDocument extends Model
{
    protected function casts(): array
    {
        return [
            'license_expiry_date' => 'date',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'rejection_date' => 'datetime',
        ];
    }

    /**
     * The guide being verified
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The admin who reviewed this application
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if this verification is pending
     */
    public function isPending(): bool
    {
        return $this->submission_status === 'pending';
    }

    /**
     * Check if this verification is approved
     */
    public function isApproved(): bool
    {
        return $this->submission_status === 'approved';
    }

    /**
     * Check if this verification is rejected
     */
    public function isRejected(): bool
    {
        return $this->submission_status === 'rejected';
    }

    /**
     * Mark as approved by admin
     */
    public function approve(User $admin): void
    {
        $this->update([
            'submission_status' => 'approved',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
            'rejection_date' => null,
        ]);

        // Also update the tour guide profile
        $this->guide->tourGuideProfile()->update([
            'verification_status' => 'approved',
            'is_verified' => true,
        ]);
    }

    /**
     * Mark as rejected by admin with reason
     */
    public function reject(User $admin, string $reason): void
    {
        $this->update([
            'submission_status' => 'rejected',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
            'rejection_date' => now(),
        ]);

        // Update the tour guide profile to rejected status
        $this->guide->tourGuideProfile()->update([
            'verification_status' => 'rejected',
            'is_verified' => false,
        ]);
    }
}
