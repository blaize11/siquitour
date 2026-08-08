<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Provinces table
        Schema::create('provinces', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('psgc_code')->nullable();
            $table->string('region')->nullable();
            $table->timestamps();
        });

        // Municipalities table
        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('psgc_code')->nullable();
            $table->timestamps();
            $table->unique(['province_id', 'name']);
        });

        // Barangays table
        Schema::create('barangays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('psgc_code')->nullable();
            $table->timestamps();
            $table->unique(['municipality_id', 'name']);
        });

        // Landmarks table
        Schema::create('landmarks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('barangay_id')->constrained()->cascadeOnDelete();
            $table->string('category')->nullable(); // beach, waterfall, church, etc.
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('opening_hours')->nullable();
            $table->decimal('entrance_fee', 8, 2)->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landmarks');
        Schema::dropIfExists('barangays');
        Schema::dropIfExists('municipalities');
        Schema::dropIfExists('provinces');
    }
};
