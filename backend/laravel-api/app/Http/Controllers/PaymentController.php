<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\PayMongoClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function pay(Request $request, Booking $booking, PayMongoClient $payMongo)
    {
        abort_unless($booking->guest_id === $request->user()->id, 403);
        abort_if(in_array($booking->status, ['cancelled', 'declined'], true), 422, 'This booking can no longer be paid for.');
        abort_if($booking->payment && $booking->payment->status === 'paid', 422, 'This booking has already been paid.');

        try {
            $session = $payMongo->createCheckoutSession(
                $booking,
                successUrl: 'siquitour://payment-return?status=success&booking_id='.$booking->id,
                cancelUrl: 'siquitour://payment-return?status=cancelled&booking_id='.$booking->id,
            );
        } catch (RequestException|ConnectionException $e) {
            Log::warning('PayMongo checkout session creation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to start payment right now. Please try again later.',
            ], 502);
        }

        Payment::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'provider' => 'paymongo',
                'amount' => $booking->total_price,
                'status' => 'pending',
                'external_reference' => $session['id'],
            ]
        );

        return response()->json(['checkout_url' => $session['checkout_url']]);
    }

    /**
     * Public webhook endpoint (no auth:sanctum) — PayMongo calls this directly.
     *
     * NOTE: the exact event payload shape below (`data.attributes.type` for the event
     * name, `data.attributes.data.id` for the checkout session id) follows PayMongo's
     * general event-envelope pattern but was not directly confirmed from a real webhook
     * delivery during implementation. Verify against an actual payload (PayMongo's
     * dashboard has a webhook log/replay tool) before relying on this in production.
     */
    public function webhook(Request $request, PayMongoClient $payMongo)
    {
        if (! $payMongo->verifyWebhookSignature($request)) {
            abort(400, 'Invalid webhook signature.');
        }

        $eventType = $request->input('data.attributes.type');
        $sessionId = $request->input('data.attributes.data.id');

        if ($eventType !== 'checkout_session.payment.paid' || ! $sessionId) {
            return response()->json(['received' => true]);
        }

        $payment = Payment::where('external_reference', $sessionId)->first();

        if (! $payment) {
            Log::warning('PayMongo webhook: no payment found for checkout session', ['session_id' => $sessionId]);

            return response()->json(['received' => true]);
        }

        $payment->update(['status' => 'paid']);

        $booking = $payment->booking;
        if ($booking && $booking->status === 'pending') {
            $booking->update(['status' => 'accepted']);
        }

        return response()->json(['received' => true]);
    }
}
