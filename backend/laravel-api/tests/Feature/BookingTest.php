<?php

namespace Tests\Feature;

use App\Models\Block;
use App\Models\CommissionSetting;
use App\Models\Rental;
use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Auth guards cache their resolved user for the app instance's lifetime, which spans
     * a whole test; forgetting them before each simulated request keeps multi-actor
     * sequences (guest books, guide accepts, ...) behaving like real separate requests.
     */
    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_guest_books_a_guide_and_the_guide_accepts_and_completes_it(): void
    {
        CommissionSetting::create(['percentage' => 10, 'is_active' => true]);

        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 500]);

        $guest = User::factory()->create();

        $bookingResponse = $this->asUser($guest)->postJson('/api/bookings', [
            'bookable_type' => 'guide',
            'bookable_id' => $guide->id,
            'pax_count' => 2,
            'start_date' => now()->addDay()->toDateString(),
        ]);

        $bookingResponse->assertCreated();
        $bookingId = $bookingResponse->json('id');
        $this->assertEquals(1000, $bookingResponse->json('total_price'));
        $this->assertEquals(100, $bookingResponse->json('commission_amount'));

        $this->asUser($guide)->postJson("/api/bookings/{$bookingId}/accept")
            ->assertOk()
            ->assertJsonFragment(['status' => 'accepted']);

        $this->asUser($guide)->postJson("/api/bookings/{$bookingId}/complete")
            ->assertOk()
            ->assertJsonFragment(['status' => 'completed']);

        $this->asUser($guest)->postJson("/api/bookings/{$bookingId}/review", ['rating' => 5, 'comment' => 'Great tour!'])
            ->assertCreated();
    }

    public function test_guest_books_a_rental_and_renter_can_decline(): void
    {
        $renter = User::factory()->renter()->create();
        $rental = Rental::create([
            'renter_id' => $renter->id,
            'type' => 'motorbike',
            'title' => 'Honda Click',
            'price_per_day' => 300,
            'status' => 'active',
        ]);

        $guest = User::factory()->create();

        $bookingResponse = $this->asUser($guest)->postJson('/api/bookings', [
            'bookable_type' => 'rental',
            'bookable_id' => $rental->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ]);

        $bookingResponse->assertCreated();
        $this->assertEquals(900, $bookingResponse->json('total_price'));
        $bookingId = $bookingResponse->json('id');

        $this->asUser($renter)->postJson("/api/bookings/{$bookingId}/decline")
            ->assertOk()
            ->assertJsonFragment(['status' => 'declined']);
    }

    public function test_blocked_guest_cannot_book_the_blocking_guide(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 500]);

        $guest = User::factory()->create();
        Block::create(['blocker_id' => $guide->id, 'blocked_id' => $guest->id]);

        $this->asUser($guest)->postJson('/api/bookings', [
            'bookable_type' => 'guide',
            'bookable_id' => $guide->id,
            'pax_count' => 1,
            'start_date' => now()->addDay()->toDateString(),
        ])->assertForbidden();
    }

    public function test_only_the_owning_guide_can_accept_a_booking(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 500]);
        $otherGuide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $otherGuide->id, 'rate_per_pax' => 500]);

        $guest = User::factory()->create();

        $bookingResponse = $this->asUser($guest)->postJson('/api/bookings', [
            'bookable_type' => 'guide',
            'bookable_id' => $guide->id,
            'pax_count' => 1,
            'start_date' => now()->addDay()->toDateString(),
        ]);
        $bookingId = $bookingResponse->json('id');

        $this->asUser($otherGuide)->postJson("/api/bookings/{$bookingId}/accept")
            ->assertForbidden();
    }

    public function test_guest_can_cancel_a_pending_booking(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 500]);
        $guest = User::factory()->create();

        $bookingResponse = $this->asUser($guest)->postJson('/api/bookings', [
            'bookable_type' => 'guide',
            'bookable_id' => $guide->id,
            'pax_count' => 1,
            'start_date' => now()->addDay()->toDateString(),
        ]);
        $bookingId = $bookingResponse->json('id');

        $this->asUser($guest)->postJson("/api/bookings/{$bookingId}/cancel")
            ->assertOk()
            ->assertJsonFragment(['status' => 'cancelled']);
    }
}
