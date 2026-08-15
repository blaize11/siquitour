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
        Schema::create('booking_itinerary_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_number');
            $table->unsignedTinyInteger('sort_order');
            $table->string('stoppable_type');
            $table->unsignedBigInteger('stoppable_id');
            $table->string('name_snapshot');
            $table->enum('fee_type_snapshot', ['per_pax', 'donation', 'consumable', 'free'])->default('free');
            $table->decimal('fee_amount_snapshot', 10, 2)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('booking_id');
            $table->index(['stoppable_type', 'stoppable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_itinerary_stops');
    }
};
