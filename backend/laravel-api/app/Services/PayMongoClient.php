<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PayMongoClient
{
    private const API_BASE = 'https://api.paymongo.com/v2';

    public function __construct(
        private readonly string $secretKey,
        private readonly string $webhookSecret,
        private readonly array $paymentMethodTypes,
    ) {
    }

    /**
     * @return array{id: string, checkout_url: string}
     *
     * @throws RequestException
     */
    public function createCheckoutSession(Booking $booking, string $successUrl, string $cancelUrl): array
    {
        $amountInCentavos = (int) round(((float) $booking->total_price) * 100);

        $response = Http::withBasicAuth($this->secretKey, '')
            ->acceptJson()
            ->post(self::API_BASE.'/checkout_sessions', [
                'data' => [
                    'attributes' => [
                        'line_items' => [[
                            'name' => 'SiquiTour booking #'.$booking->id,
                            'amount' => $amountInCentavos,
                            'currency' => 'PHP',
                            'quantity' => 1,
                        ]],
                        'payment_method_types' => $this->paymentMethodTypes,
                        'success_url' => $successUrl,
                        'cancel_url' => $cancelUrl,
                        'reference_number' => (string) $booking->id,
                    ],
                ],
            ]);

        $response->throw();

        $data = $response->json('data');

        return [
            'id' => $data['id'],
            'checkout_url' => $data['attributes']['checkout_url'],
        ];
    }

    /**
     * Verifies the `Paymongo-Signature` header against the raw request body.
     *
     * NOTE: this follows PayMongo's generally-documented pattern (a header of the form
     * `t=<timestamp>,te=<test-mode signature>,li=<live-mode signature>`, each an
     * HMAC-SHA256 of "{timestamp}.{raw body}" using the webhook's signing secret) but
     * the exact header/format was not directly confirmed from their docs during
     * implementation — re-check against a real webhook delivery before relying on this
     * in production.
     */
    public function verifyWebhookSignature(Request $request): bool
    {
        if ($this->webhookSecret === '') {
            return false;
        }

        $header = $request->header('Paymongo-Signature', '');
        $parts = [];
        foreach (explode(',', $header) as $segment) {
            [$key, $value] = array_pad(explode('=', $segment, 2), 2, null);
            if ($key !== null && $value !== null) {
                $parts[$key] = $value;
            }
        }

        if (! isset($parts['t']) || (! isset($parts['te']) && ! isset($parts['li']))) {
            return false;
        }

        $expected = hash_hmac('sha256', $parts['t'].'.'.$request->getContent(), $this->webhookSecret);

        return hash_equals($expected, $parts['te'] ?? '') || hash_equals($expected, $parts['li'] ?? '');
    }
}
