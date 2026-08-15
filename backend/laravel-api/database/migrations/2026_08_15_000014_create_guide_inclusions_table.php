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
        Schema::create('guide_inclusions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_guide_profile_id')->constrained('tour_guide_profiles')->onDelete('cascade');
            $table->string('label'); // e.g., "Meals", "Transportation", "Hotel", "Guide Fee"
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Ensure unique inclusions per guide (same label can appear multiple times for different guides)
            $table->index('tour_guide_profile_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_inclusions');
    }
};
