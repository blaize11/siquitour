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
        Schema::create('inclusions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('slug');
            $table->index('sort_order');
        });

        // Pivot: guides select from shared inclusions
        // Using guide_inclusion_catalog to avoid conflict with legacy guide_inclusions
        Schema::create('guide_inclusion_catalog', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_guide_profile_id')->constrained('tour_guide_profiles')->cascadeOnDelete();
            $table->foreignId('inclusion_id')->constrained('inclusions')->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tour_guide_profile_id', 'inclusion_id'], 'uq_guide_incl');
            $table->index('tour_guide_profile_id');
            $table->index('inclusion_id');
        });

        // Pivot: packages optionally override inclusions
        Schema::create('package_inclusions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_package_id')->constrained('tour_packages')->cascadeOnDelete();
            $table->foreignId('inclusion_id')->constrained('inclusions')->cascadeOnDelete();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['tour_package_id', 'inclusion_id'], 'uq_pkg_incl');
            $table->index('tour_package_id');
            $table->index('inclusion_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_inclusions');
        Schema::dropIfExists('guide_inclusion_catalog');
        Schema::dropIfExists('inclusions');
    }
};
