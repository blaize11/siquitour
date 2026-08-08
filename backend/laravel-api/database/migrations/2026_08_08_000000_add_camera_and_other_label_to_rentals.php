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
        Schema::table('rentals', function (Blueprint $table) {
            // Change enum to add 'camera' and 'other'
            $table->enum('type', ['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room', 'camera', 'other'])->change();

            // Add optional label for 'other' type
            $table->string('other_label')->nullable()->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            // Revert enum to original
            $table->enum('type', ['motorbike', 'car', 'tuktuk', 'van', 'bicycle', 'room'])->change();

            // Drop other_label
            $table->dropColumn('other_label');
        });
    }
};
