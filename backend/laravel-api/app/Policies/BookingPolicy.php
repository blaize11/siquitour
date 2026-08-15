<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\Rental;
use App\Models\User;

class BookingPolicy
{
    /**
     * Only guests can create bookings (enforced via middleware).
     */
    public function create(User $user): bool
    {
        return $user->isRole('guest');
    }

    /**
     * Anyone involved can view a booking; admins can view all.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $user->isRole('admin')
            || $booking->guest_id === $user->id
            || $this->respond($user, $booking);
    }

    /**
     * Only the provider can accept a pending booking.
     */
    public function accept(User $user, Booking $booking): bool
    {
        return $booking->status === 'pending'
            && $this->respond($user, $booking)
            && ($user->isRole('tour_guide') || $user->isRole('renter'));
    }

    /**
     * Only the provider can decline a pending/accepted booking.
     */
    public function decline(User $user, Booking $booking): bool
    {
        return in_array($booking->status, ['pending', 'accepted'], true)
            && $this->respond($user, $booking);
    }

    /**
     * Anyone involved or admin can cancel.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        return $user->isRole('admin')
            || $booking->guest_id === $user->id
            || $this->respond($user, $booking);
    }

    /**
     * Only provider or admin can mark as completed.
     */
    public function complete(User $user, Booking $booking): bool
    {
        return $user->isRole('admin')
            || $this->respond($user, $booking);
    }

    /**
     * Admin only: view all bookings index.
     */
    public function viewAll(User $user): bool
    {
        return $user->isRole('admin');
    }

    /**
     * Whether $user is the tour guide or renter who owns the thing being booked,
     * i.e. the party who can accept/decline/complete the booking.
     */
    public function respond(User $user, Booking $booking): bool
    {
        if ($booking->bookable_type === User::class) {
            return $booking->bookable_id === $user->id;
        }

        if ($booking->bookable_type === Rental::class) {
            return $booking->bookable instanceof Rental && $booking->bookable->renter_id === $user->id;
        }

        return false;
    }
}
