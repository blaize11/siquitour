<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add verification_status to tour_guide_profiles.
     * Tracks: not_submitted → pending_review → approved or rejected
     *
     * Backward compatibility:
     * - is_verified = true  → verification_status = 'approved'
     * - is_verified = false → verification_status = 'not_submitted' (default)
     */
    public function up(): void
    {
        Schema::table('tour_guide_profiles', function (Blueprint $table) {
            $table->enum('verification_status', [
                'not_submitted',      // User hasn't submitted license yet
                'pending_review',     // Submitted, awaiting admin review
                'approved',           // Admin approved
                'rejected',           // Admin rejected
            ])
            ->default('not_submitted')
            ->after('is_verified')
            ->index();
        });

        // Migrate existing verified guides to 'approved' status
        // Those with is_verified = true should be marked as approved
        DB::statement(
            'UPDATE tour_guide_profiles SET verification_status = "approved" WHERE is_verified = true'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_guide_profiles', function (Blueprint $table) {
            $table->dropColumn('verification_status');
        });
    }
};
