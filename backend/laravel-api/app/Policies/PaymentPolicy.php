<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /**
     * CRITICAL: Only guests can create/pay for bookings.
     * This is a hard rule that protects the entire revenue model.
     */
    public function create(User $user): bool
    {
        return $user->isRole('guest');
    }

    /**
     * Guests can view their own payment receipts.
     * Tour guides/renters can view their earnings.
     * Admins can view all.
     */
    public function view(User $user, Payment $payment): bool
    {
        return $user->isRole('admin')
            || ($user->isRole('guest') && $payment->booking->guest_id === $user->id)
            || ($payment->booking->provider_id === $user->id);
    }

    /**
     * Guests can request payout (not implemented yet, for future).
     */
    public function requestPayout(User $user): bool
    {
        return $user->isRole('tour_guide') || $user->isRole('renter');
    }

    /**
     * Admin only: approve/release payouts.
     */
    public function approvePayout(User $user, Payment $payment): bool
    {
        return $user->isRole('admin');
    }

    /**
     * Admin only: issue refunds.
     */
    public function refund(User $user, Payment $payment): bool
    {
        return $user->isRole('admin');
    }
}
