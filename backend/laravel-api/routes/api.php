<?php

use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\SpotController as AdminSpotController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\Guide\AvailabilityController;
use App\Http\Controllers\Guide\ProfileController as GuideProfileController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Renter\RentalController as RenterRentalController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SpotController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Location endpoints (for address selection)
Route::get('/locations/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/municipalities/{provinceId}', [LocationController::class, 'municipalities']);
Route::get('/locations/barangays/{municipalityId}', [LocationController::class, 'barangays']);
Route::get('/locations/landmarks/{barangayId}', [LocationController::class, 'landmarks']);
Route::get('/locations/details/{barangayId}', [LocationController::class, 'locationDetails']);

// Public browse.
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{guide}', [GuideController::class, 'show']);
Route::get('/guides/{guide}/booked-dates', [GuideController::class, 'bookedDates']);
Route::get('/rentals', [RentalController::class, 'index']);
Route::get('/rentals/{rental}', [RentalController::class, 'show']);
Route::get('/rentals/{rental}/booked-dates', [RentalController::class, 'bookedDates']);
Route::get('/spots', [SpotController::class, 'index']);
Route::get('/spots/{spot}', [SpotController::class, 'show']);

// Public webhook — PayMongo calls this directly, verified via signature instead of auth:sanctum.
Route::post('/webhooks/paymongo', [PaymentController::class, 'webhook']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Bookings.
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::post('/bookings/{booking}/accept', [BookingController::class, 'accept']);
    Route::post('/bookings/{booking}/decline', [BookingController::class, 'decline']);
    Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
    Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('/bookings/{booking}/review', [ReviewController::class, 'store']);
    Route::post('/bookings/{booking}/pay', [PaymentController::class, 'pay']);

    // Follows & blocks.
    Route::post('/users/{user}/follow', [FollowController::class, 'store']);
    Route::delete('/users/{user}/follow', [FollowController::class, 'destroy']);
    Route::post('/users/{user}/block', [BlockController::class, 'store']);
    Route::delete('/users/{user}/block', [BlockController::class, 'destroy']);

    // Chat.
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);

    // Tour guide self-service.
    Route::middleware('role:tour_guide')->prefix('guide')->group(function () {
        Route::put('/profile', [GuideProfileController::class, 'update']);
        Route::get('/availability', [AvailabilityController::class, 'index']);
        Route::post('/availability', [AvailabilityController::class, 'store']);
        Route::delete('/availability/{availability}', [AvailabilityController::class, 'destroy']);
    });

    // Renter self-service.
    Route::middleware('role:renter')->prefix('renter')->group(function () {
        Route::get('/rentals', [RenterRentalController::class, 'index']);
        Route::post('/rentals', [RenterRentalController::class, 'store']);
        Route::put('/rentals/{rental}', [RenterRentalController::class, 'update']);
        Route::delete('/rentals/{rental}', [RenterRentalController::class, 'destroy']);
        Route::post('/rentals/{rental}/images', [RenterRentalController::class, 'addImage']);
        Route::delete('/rentals/{rental}/images/{image}', [RenterRentalController::class, 'deleteImage']);
    });

    // Admin management.
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users/{user}/verify', [AdminUserController::class, 'verify']);
        Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);

        Route::get('/commission', [CommissionController::class, 'show']);
        Route::put('/commission', [CommissionController::class, 'update']);

        Route::post('/spots', [AdminSpotController::class, 'store']);
        Route::put('/spots/{spot}', [AdminSpotController::class, 'update']);
        Route::delete('/spots/{spot}', [AdminSpotController::class, 'destroy']);
    });
});
