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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // 'booking_accepted', 'booking_declined', 'booking_request', 'rental_booked', 'review_posted', 'message_received'
            $table->string('title');
            $table->text('message');
            $table->string('icon')->default('📌');
            $table->unsignedBigInteger('related_id')->nullable(); // booking_id, rental_id, review_id, etc.
            $table->string('related_type')->nullable(); // 'booking', 'rental', 'review', 'message'
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
