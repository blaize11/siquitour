<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Renames 'rate_basis' to 'price_basis' for semantic clarity:
     * - 'rate_basis' implied: is the tier price per-pax or a total?
     * - 'price_basis' implies: does the tier price multiply by duration_days?
     *
     * Values are updated:
     * - 'total_per_group' → 'per_package'
     * - 'per_pax' → 'per_day' (if any exist; currently all are 'total_per_group')
     */
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            // Add new column with the new name and values
            $table->enum('price_basis', ['per_day', 'per_package'])->default('per_package')->after('cover_image_url');
        });

        // Migrate data: total_per_group → per_package
        DB::table('tour_packages')
            ->where('rate_basis', 'total_per_group')
            ->update(['price_basis' => 'per_package']);

        // Migrate data: per_pax → per_day (if any)
        DB::table('tour_packages')
            ->where('rate_basis', 'per_pax')
            ->update(['price_basis' => 'per_day']);

        // Drop old column
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn('rate_basis');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            // Add old column back
            $table->enum('rate_basis', ['total_per_group', 'per_pax'])
                  ->default('total_per_group')
                  ->after('cover_image_url');
        });

        // Migrate data back: per_package → total_per_group
        DB::table('tour_packages')
            ->where('price_basis', 'per_package')
            ->update(['rate_basis' => 'total_per_group']);

        // Migrate data back: per_day → per_pax
        DB::table('tour_packages')
            ->where('price_basis', 'per_day')
            ->update(['rate_basis' => 'per_pax']);

        // Drop new column
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn('price_basis');
        });
    }
};
