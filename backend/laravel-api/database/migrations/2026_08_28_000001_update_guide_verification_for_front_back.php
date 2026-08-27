<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Split driver's license storage into FRONT and BACK images.
     * Migrate existing single file to front image for backward compatibility.
     */
    public function up(): void
    {
        Schema::table('guide_verification_documents', function (Blueprint $table) {
            // Add new columns for front and back images
            $table->string('driver_license_front_file_path')->nullable()->after('user_id');
            $table->string('driver_license_back_file_path')->nullable()->after('driver_license_front_file_path');
        });

        // Migrate existing single file to front image
        \DB::statement(
            'UPDATE guide_verification_documents SET driver_license_front_file_path = driver_license_file_path WHERE driver_license_file_path IS NOT NULL'
        );

        // Drop the old single file column
        Schema::table('guide_verification_documents', function (Blueprint $table) {
            $table->dropColumn('driver_license_file_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guide_verification_documents', function (Blueprint $table) {
            // Recreate old column
            $table->string('driver_license_file_path')->nullable();
        });

        // Migrate back from front to single field
        \DB::statement(
            'UPDATE guide_verification_documents SET driver_license_file_path = driver_license_front_file_path WHERE driver_license_front_file_path IS NOT NULL'
        );

        Schema::table('guide_verification_documents', function (Blueprint $table) {
            $table->dropColumn('driver_license_front_file_path');
            $table->dropColumn('driver_license_back_file_path');
        });
    }
};
