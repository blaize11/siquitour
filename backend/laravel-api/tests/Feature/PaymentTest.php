<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    private function makeBooking(): Booking
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 500]);
        $guest = User::factory()->create();

        return Booking::create([
            'guest_id' => $guest->id,
            'bookable_type' => User::class,
            'bookable_id' => $guide->id,
            'pax_count' => 2,
            'start_date' => now()->addDay()->toDateString(),
            'status' => 'pending',
            'total_price' => 1000,
            'commission_amount' => 100,
        ]);
    }

    public function test_guest_can_start_a_payment_for_their_booking(): void
    {
        Http::fake([
            'api.paymongo.com/*' => Http::response([
                'data' => [
                    'id' => 'cs_test_123',
                    'attributes' => ['checkout_url' => 'https://checkout.paymongo.com/cs_test_123'],
                ],
            ], 200),
        ]);

        $booking = $this->makeBooking();
        $guest = $booking->guest;

        $response = $this->asUser($guest)->postJson("/api/bookings/{$booking->id}/pay");

        $response->assertOk()->assertJson(['checkout_url' => 'https://checkout.paymongo.com/cs_test_123']);
        $this->assertDatabaseHas('payments', [
            'booking_id' => $booking->id,
            'external_reference' => 'cs_test_123',
            'status' => 'pending',
        ]);
    }

    public function test_only_the_booking_owner_can_pay(): void
    {
        Http::fake(['api.paymongo.com/*' => Http::response(['data' => ['id' => 'x', 'attributes' => ['checkout_url' => 'x']]])]);

        $booking = $this->makeBooking();
        $stranger = User::factory()->create();

        $this->asUser($stranger)->postJson("/api/bookings/{$booking->id}/pay")->assertForbidden();
    }

    public function test_cannot_pay_for_an_already_paid_booking(): void
    {
        $booking = $this->makeBooking();
        Payment::create([
            'booking_id' => $booking->id,
            'provider' => 'paymongo',
            'amount' => $booking->total_price,
            'status' => 'paid',
            'external_reference' => 'cs_already_paid',
        ]);

        $this->asUser($booking->guest)->postJson("/api/bookings/{$booking->id}/pay")->assertStatus(422);
    }

    public function test_a_failed_paymongo_request_returns_a_graceful_error(): void
    {
        Http::fake(['api.paymongo.com/*' => Http::response(['errors' => [['detail' => 'invalid key']]], 401)]);

        $booking = $this->makeBooking();

        $this->asUser($booking->guest)->postJson("/api/bookings/{$booking->id}/pay")->assertStatus(502);
    }

    public function test_a_connection_failure_returns_a_graceful_error_not_a_crash(): void
    {
        // Simulates the kind of low-level failure (e.g. a broken local CA bundle, DNS
        // failure, timeout) that throws ConnectionException rather than RequestException —
        // this must not leak as an uncaught 500.
        Http::fake([
            'api.paymongo.com/*' => fn () => throw new ConnectionException('Could not connect'),
        ]);

        $booking = $this->makeBooking();

        $this->asUser($booking->guest)->postJson("/api/bookings/{$booking->id}/pay")->assertStatus(502);
    }

    public function test_webhook_marks_payment_paid_and_accepts_the_booking(): void
    {
        config(['services.paymongo.webhook_secret' => 'test_webhook_secret']);

        $booking = $this->makeBooking();
        Payment::create([
            'booking_id' => $booking->id,
            'provider' => 'paymongo',
            'amount' => $booking->total_price,
            'status' => 'pending',
            'external_reference' => 'cs_test_123',
        ]);

        $payload = [
            'data' => [
                'attributes' => [
                    'type' => 'checkout_session.payment.paid',
                    'data' => ['id' => 'cs_test_123'],
                ],
            ],
        ];

        $timestamp = (string) time();
        $signature = hash_hmac('sha256', $timestamp.'.'.json_encode($payload), 'test_webhook_secret');

        $response = $this->withHeader('Paymongo-Signature', "t={$timestamp},te={$signature}")
            ->postJson('/api/webhooks/paymongo', $payload);

        $response->assertOk();
        $this->assertDatabaseHas('payments', ['external_reference' => 'cs_test_123', 'status' => 'paid']);
        $this->assertDatabaseHas('bookings', ['id' => $booking->id, 'status' => 'accepted']);
    }

    public function test_webhook_rejects_an_invalid_signature(): void
    {
        config(['services.paymongo.webhook_secret' => 'test_webhook_secret']);

        $response = $this->withHeader('Paymongo-Signature', 't=123,te=not-a-real-signature')
            ->postJson('/api/webhooks/paymongo', ['data' => ['attributes' => ['type' => 'checkout_session.payment.paid']]]);

        $response->assertStatus(400);
    }
}
