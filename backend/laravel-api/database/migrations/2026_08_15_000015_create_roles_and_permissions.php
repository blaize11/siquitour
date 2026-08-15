<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique(); // 'guest', 'tour_guide', 'renter', 'admin'
            $table->string('display_name')->default('');
            $table->timestamps();
        });

        // Create user_roles junction table (many-to-many)
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->enum('status', ['active', 'pending', 'verified', 'suspended'])->default('active');
            $table->boolean('is_primary')->default(false); // which role shows by default
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            // Unique constraint: one role per user only once
            $table->unique(['user_id', 'role_id']);
            $table->index('status');
        });

        // Create audit_logs table for admin actions
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // 'verified_user', 'suspended_user', etc.
            $table->string('resource_type'); // 'user', 'booking', 'listing', etc.
            $table->bigInteger('resource_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['admin_id', 'created_at']);
            $table->index(['resource_type', 'resource_id']);
        });

        // Seed roles
        DB::table('roles')->insert([
            ['name' => 'guest', 'display_name' => 'Guest/Tourist'],
            ['name' => 'tour_guide', 'display_name' => 'Tour Guide'],
            ['name' => 'renter', 'display_name' => 'Renter'],
            ['name' => 'admin', 'display_name' => 'Super Admin'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('roles');
    }
};
