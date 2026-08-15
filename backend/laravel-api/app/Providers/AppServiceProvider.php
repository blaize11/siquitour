<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Payment;
use App\Policies\BookingPolicy;
use App\Policies\PaymentPolicy;
use App\Services\PayMongoClient;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PayMongoClient::class, function () {
            return new PayMongoClient(
                secretKey: (string) config('services.paymongo.secret_key'),
                webhookSecret: (string) config('services.paymongo.webhook_secret'),
                paymentMethodTypes: (array) config('services.paymongo.payment_method_types'),
            );
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register authorization policies
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(Payment::class, PaymentPolicy::class);
    }
}
