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
        Schema::table('spots', function (Blueprint $table) {
            // Change category enum to include more specific types
            $table->string('category')->change();

            // Add new fields
            $table->string('slug')->unique()->nullable()->after('name');
            $table->enum('municipality', [
                'Lazi',
                'San Juan',
                'Larena',
                'Maria',
                'Siquijor',
                'Enrique Villanueva',
                'San Antonio'
            ])->nullable()->after('description');
            $table->enum('fee_type', ['per_pax', 'donation', 'consumable', 'free'])->default('free')->after('municipality');
            $table->decimal('fee_amount', 10, 2)->nullable()->after('fee_type');
            $table->unsignedSmallInteger('typical_duration_minutes')->default(60)->after('fee_amount');
            $table->boolean('is_active')->default(true)->after('typical_duration_minutes');
            $table->index('municipality');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spots', function (Blueprint $table) {
            $table->dropIndex('spots_municipality_index');
            $table->dropIndex('spots_category_index');
            $table->dropColumn(['slug', 'municipality', 'fee_type', 'fee_amount', 'typical_duration_minutes', 'is_active']);
            $table->enum('category', ['spot', 'restaurant'])->change();
        });
    }
};
