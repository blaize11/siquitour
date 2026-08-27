<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Driver's License Verification Documents
     * Tracks guide verification submissions and admin reviews.
     */
    public function up(): void
    {
        Schema::create('guide_verification_documents', function (Blueprint $table) {
            $table->id();

            // Guide being verified
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // Driver's license file information
            $table->string('driver_license_file_path');
            $table->string('license_number', 50);
            $table->date('license_expiry_date')->nullable();

            // Verification status tracking
            $table->enum('submission_status', ['pending', 'approved', 'rejected'])
                ->default('pending')
                ->index();

            // Submission metadata
            $table->timestamp('submitted_at');

            // Admin review metadata
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Admin who reviewed this application');

            // Rejection details
            $table->text('rejection_reason')->nullable();
            $table->timestamp('rejection_date')->nullable();

            // Admin notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index('submission_status', 'idx_status');
            $table->index('submitted_at', 'idx_submitted');
            $table->index(['submission_status', 'submitted_at'], 'idx_status_submitted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_verification_documents');
    }
};
