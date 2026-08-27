<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Remove rate_per_pax from tour_guide_profiles since we now use guide_pax_prices
     * for flexible per-pax pricing instead of a flat rate.
     */
    public function up(): void
    {
        Schema::table('tour_guide_profiles', function (Blueprint $table) {
            $table->dropColumn('rate_per_pax');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_guide_profiles', function (Blueprint $table) {
            $table->decimal('rate_per_pax', 10, 2)->default(0)->after('years_experience');
        });
    }
};
