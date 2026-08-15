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
        Schema::create('tour_package_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_package_id')->constrained('tour_packages')->cascadeOnDelete();
            $table->foreignId('tour_package_addon_id')->nullable()->constrained('tour_package_addons')->cascadeOnDelete();
            $table->unsignedSmallInteger('min_pax');
            $table->unsignedSmallInteger('max_pax');
            $table->decimal('price', 10, 2);
            $table->timestamps();

            $table->index('tour_package_id');
            $table->index('tour_package_addon_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_package_rates');
    }
};
