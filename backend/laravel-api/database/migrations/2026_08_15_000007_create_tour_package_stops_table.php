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
        Schema::create('tour_package_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_package_day_id')->constrained('tour_package_days')->cascadeOnDelete();
            $table->string('stoppable_type');
            $table->unsignedBigInteger('stoppable_id');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_optional')->default(false);
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('tour_package_day_id');
            $table->index(['stoppable_type', 'stoppable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_package_stops');
    }
};
