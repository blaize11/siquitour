<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates a persistent quotes table that freezes all pricing details at the moment of quoting.
     * Quotes are immutable after creation and can expire or be superseded.
     * Bookings link to quotes to preserve the agreed-upon price.
     */
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();

            // Polymorphic: can quote either a Package or a CustomTourRequest
            $table->string('quotable_type'); // 'App\\Models\\TourPackage' or 'App\\Models\\CustomTourRequest'
            $table->unsignedBigInteger('quotable_id');

            // Quoted parameters
            $table->unsignedSmallInteger('pax');
            $table->string('variant')->nullable(); // e.g., 'standard', 'drone', or NULL for custom
            $table->string('price_basis')->nullable(); // 'per_day' or 'per_package' (snapshot from package)
            $table->unsignedSmallInteger('duration_days')->nullable(); // For per_day basis

            // Cost breakdown
            $table->decimal('tier_price', 10, 2); // Base rate from the tier
            $table->decimal('included_fees_total', 10, 2)->default(0); // Entrance fees where fee_mode='included'
            $table->decimal('addons_total', 10, 2)->default(0); // Optional add-ons (if any)
            $table->decimal('total', 10, 2); // Final price (tier_price + included_fees_total + addons_total)

            // Full breakdown snapshot (JSON) — allows audit trail and display
            // Example:
            // {
            //   "charged": { "subtotal": "150.00", "lines": [...] },
            //   "payable_on_site": { "subtotal": "1500.00", "lines": [...] },
            //   "donations": [...]
            // }
            $table->json('breakdown')->nullable();

            // Currency
            $table->string('currency')->default('PHP');

            // Lifecycle
            $table->dateTime('expires_at')->nullable(); // Quote becomes invalid after this time
            $table->unsignedBigInteger('superseded_by_quote_id')->nullable(); // If a newer quote replaces this
            $table->foreign('superseded_by_quote_id')->references('id')->on('quotes')->nullOnDelete();

            // Audit trail
            $table->unsignedBigInteger('issued_by_user_id')->nullable(); // Guide who issued (NULL for auto-computed)
            $table->foreign('issued_by_user_id')->references('id')->on('users')->nullOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['quotable_type', 'quotable_id']);
            $table->index('pax');
            $table->index('expires_at');
            $table->index('issued_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
