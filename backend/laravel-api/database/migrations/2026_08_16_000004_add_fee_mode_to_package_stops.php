<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds per-stop fee configuration:
     * - fee_mode: how guests pay for this stop's entrance (included in tour, pay on-site, or optional)
     * - override_fee: allows guide to negotiate a different entrance fee for this package
     */
    public function up(): void
    {
        Schema::table('tour_package_stops', function (Blueprint $table) {
            // fee_mode: controls where the entrance fee is charged
            // - 'included': baked into the tour package price (guest pays upfront via app)
            // - 'on_site': guest pays at the gate; app displays but does NOT add to total
            // - 'optional': guest can skip this stop
            $table->enum('fee_mode', ['included', 'on_site', 'optional'])
                  ->default('on_site')
                  ->after('is_optional')
                  ->comment('Where/how guests pay entrance fees for this stop');

            // override_fee: if set, use this instead of spot.fee_amount
            // Allows guide to negotiate discounted rates for their package
            $table->decimal('override_fee', 10, 2)
                  ->nullable()
                  ->after('fee_mode')
                  ->comment('Override the spot\'s standard entrance fee for this package (guide negotiation)');

            $table->index('fee_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_package_stops', function (Blueprint $table) {
            $table->dropIndex('tour_package_stops_fee_mode_index');
            $table->dropColumn(['fee_mode', 'override_fee']);
        });
    }
};
