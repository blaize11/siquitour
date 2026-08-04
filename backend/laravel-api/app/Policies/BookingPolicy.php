<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\Rental;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $booking->guest_id === $user->id || $this->respond($user, $booking);
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

    public function cancel(User $user, Booking $booking): bool
    {
        return $booking->guest_id === $user->id && in_array($booking->status, ['pending', 'accepted'], true);
    }
}
