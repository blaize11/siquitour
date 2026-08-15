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
        Schema::create('spot_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spot_id')->constrained('spots')->cascadeOnDelete();
            $table->string('url');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('spot_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spot_images');
    }
};
