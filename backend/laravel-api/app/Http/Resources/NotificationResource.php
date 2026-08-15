<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * NotificationResource with navigation routing.
 *
 * When a user clicks a notification, the mobile app uses the 'action' field
 * to navigate to the correct screen.
 */
class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'icon' => $this->icon,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,

            // Navigation routing
            'action' => $this->getActionRoute(),
            'related_id' => $this->related_id,
            'related_type' => $this->related_type,
        ];
    }

    /**
     * Compute the navigation action based on notification type and related entity.
     *
     * Format: "screen:id" (e.g., "booking:123", "conversation:45", "user_profile:67")
     */
    private function getActionRoute(): ?string
    {
        return match ($this->type) {
            // Booking-related notifications
            'booking_request' => "booking:{$this->related_id}",
            'booking_accepted' => "booking:{$this->related_id}",
            'booking_declined' => "booking:{$this->related_id}",
            'booking_completed' => "booking:{$this->related_id}",
            'booking_cancelled' => "booking:{$this->related_id}",

            // Review-related notifications
            'review_posted' => "review:{$this->related_id}",
            'review_reply' => "booking:{$this->related_id}", // Go to booking to see review reply

            // Chat/Message notifications
            'message_received' => "conversation:{$this->related_id}",
            'conversation_started' => "conversation:{$this->related_id}",

            // Follow notifications
            'user_followed' => "user_profile:{$this->related_id}",

            // Rental-related notifications
            'rental_booked' => "booking:{$this->related_id}",

            // Default: no navigation
            default => null,
        };
    }
}
