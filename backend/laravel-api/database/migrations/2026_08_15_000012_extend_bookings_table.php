<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('tour_package_id')->nullable()->after('bookable_id')->constrained('tour_packages')->nullOnDelete();
            $table->enum('itinerary_mode', ['default', 'custom'])->default('default')->after('tour_package_id');
            $table->decimal('quoted_package_price', 10, 2)->nullable()->after('itinerary_mode');
            $table->decimal('quoted_addons_total', 10, 2)->nullable()->after('quoted_package_price');
            $table->decimal('estimated_onsite_fees', 10, 2)->nullable()->after('quoted_addons_total');
            $table->boolean('custom_stops_added')->default(false)->after('estimated_onsite_fees');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['tour_package_id']);
            $table->dropColumn(['tour_package_id', 'itinerary_mode', 'quoted_package_price', 'quoted_addons_total', 'estimated_onsite_fees', 'custom_stops_added']);
        });
    }
};
