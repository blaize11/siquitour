<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Guide Per-Pax Pricing
     * Allows tour guides to set different prices for different group sizes.
     *
     * Example:
     * - 1 pax = ₱1,200
     * - 2 pax = ₱2,000
     * - 3 pax = ₱2,700
     * - 4 pax = ₱3,200
     */
    public function up(): void
    {
        Schema::create('guide_pax_prices', function (Blueprint $table) {
            $table->id();

            // Guide setting the price
            $table->foreignId('tour_guide_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Number of guests (1-20)
            $table->unsignedTinyInteger('pax_quantity');

            // Price for this group size
            $table->decimal('price', 10, 2);

            $table->timestamps();

            // Prevent duplicate pax entries for same guide
            $table->unique(['tour_guide_id', 'pax_quantity'], 'unique_guide_pax');

            // Indexes for common queries
            $table->index('tour_guide_id', 'idx_guide');
            $table->index(['tour_guide_id', 'pax_quantity'], 'idx_guide_pax');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_pax_prices');
    }
};
