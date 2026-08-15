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
        // Add role management columns to users
        Schema::table('users', function (Blueprint $table) {
            // Active role for multi-role support
            $table->foreignId('active_role_id')
                ->nullable()
                ->after('role')
                ->constrained('roles')
                ->onDelete('set null');

            // Verification status (pending, verified, suspended)
            $table->enum('verified_status', ['pending', 'verified', 'suspended'])
                ->default('pending')
                ->after('status');

            // Soft deletes for data preservation (spec rule #5)
            $table->softDeletes();
        });

        // Add soft deletes to bookings (preserve for accounting)
        Schema::table('bookings', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to payments (preserve for audit trail)
        Schema::table('payments', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to rentals
        Schema::table('rentals', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to reviews
        Schema::table('reviews', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to tour packages
        if (Schema::hasTable('tour_packages')) {
            Schema::table('tour_packages', function (Blueprint $table) {
                if (!Schema::hasColumn('tour_packages', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['active_role_id']);
            $table->dropColumn(['active_role_id', 'verified_status', 'deleted_at']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('rentals', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        if (Schema::hasTable('tour_packages')) {
            Schema::table('tour_packages', function (Blueprint $table) {
                if (Schema::hasColumn('tour_packages', 'deleted_at')) {
                    $table->dropSoftDeletes();
                }
            });
        }
    }
};
