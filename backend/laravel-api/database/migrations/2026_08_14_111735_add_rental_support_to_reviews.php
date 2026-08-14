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
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreignId('rental_id')->nullable()->after('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('renter_id')->nullable()->after('tour_guide_id')->constrained('users')->cascadeOnDelete();
            $table->text('renter_reply')->nullable()->after('guide_reply');
            $table->timestamp('renter_replied_at')->nullable()->after('renter_reply');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['rental_id', 'renter_id']);
            $table->dropColumn(['rental_id', 'renter_id', 'renter_reply', 'renter_replied_at']);
        });
    }
};
