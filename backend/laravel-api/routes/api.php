<?php

use App\Http\Controllers\Admin\CommissionController;
use App\Http\Controllers\Admin\RestaurantController as AdminRestaurantController;
use App\Http\Controllers\Admin\SpotController as AdminSpotController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BlockController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\Guide\AvailabilityController;
use App\Http\Controllers\Guide\PackageBuilderController;
use App\Http\Controllers\Guide\PackageController as GuidePackageController;
use App\Http\Controllers\Guide\ProfileController as GuideProfileController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Renter\RentalController as RenterRentalController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SpotController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/google-login', [AuthController::class, 'googleLogin']);

// Password reset endpoints
Route::post('/forgot-password', [AuthController::class, 'requestPasswordReset']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

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
Route::get('/guides/{guide}/packages', [PackageController::class, 'guidePackages']);
Route::get('/rentals', [RentalController::class, 'index']);
Route::get('/rentals/{rental}', [RentalController::class, 'show']);
Route::get('/rentals/{rental}/booked-dates', [RentalController::class, 'bookedDates']);
Route::get('/spots', [SpotController::class, 'index']);
Route::get('/spots/{spot}', [SpotController::class, 'show']);
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{restaurant}', [RestaurantController::class, 'show']);

// Tour packages.
Route::get('/packages/{package}', [PackageController::class, 'show']);
Route::post('/packages/{package}/quote', [PackageController::class, 'quote']);

// Public webhook — PayMongo calls this directly, verified via signature instead of auth:sanctum.
Route::post('/webhooks/paymongo', [PaymentController::class, 'webhook']);

// EXPLORE - Available to all authenticated users (guests can book, others read-only)
Route::middleware('auth:sanctum')->group(function () {
    // Dashboard - all listings
    Route::get('/explore', [ExploreController::class, 'index']);

    // Browse by type
    Route::get('/explore/guides', [ExploreController::class, 'guides']);
    Route::get('/explore/rentals', [ExploreController::class, 'rentals']);
    Route::get('/explore/spots', [ExploreController::class, 'spots']);
    Route::get('/explore/restaurants', [ExploreController::class, 'restaurants']);

    // View details
    Route::get('/explore/guides/{guide}', [ExploreController::class, 'showGuide']);
    Route::get('/explore/rentals/{rental}', [ExploreController::class, 'showRental']);
    Route::get('/explore/spots/{spot}', [ExploreController::class, 'showSpot']);
    Route::get('/explore/restaurants/{restaurant}', [ExploreController::class, 'showRestaurant']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

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

    // Reviews.
    Route::get('/reviews', [ReviewController::class, 'index']); // Tour guide reviews
    Route::get('/reviews/my-reviews', [ReviewController::class, 'getGuestReviews']); // Guest posted reviews
    Route::patch('/reviews/{review}/reply', [ReviewController::class, 'reply']); // Tour guide reply
    Route::patch('/reviews/{review}/renter-reply', [ReviewController::class, 'renterReply']); // Renter reply

    // Notifications.
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // Chat.
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store']);
    Route::post('/conversations/{conversation}/messages/mark-read', [MessageController::class, 'markAsRead']);

    // Tour guide self-service.
    Route::middleware('role:tour_guide')->prefix('guide')->group(function () {
        Route::get('/profile', [GuideController::class, 'getMyProfile']);
        Route::put('/profile', [GuideController::class, 'updateMyProfile']);

        // Guide profile inclusions.
        Route::post('/inclusions', [GuideController::class, 'addInclusion']);
        Route::put('/inclusions/{inclusion}', [GuideController::class, 'updateInclusion']);
        Route::delete('/inclusions/{inclusion}', [GuideController::class, 'deleteInclusion']);
        Route::put('/inclusions/reorder', [GuideController::class, 'reorderInclusions']);

        Route::get('/availability', [AvailabilityController::class, 'index']);
        Route::post('/availability', [AvailabilityController::class, 'store']);
        Route::delete('/availability/{availability}', [AvailabilityController::class, 'destroy']);

        // Tour packages.
        Route::get('/packages', [GuidePackageController::class, 'index']);
        Route::post('/packages', [GuidePackageController::class, 'store']);
        Route::put('/packages/{package}', [GuidePackageController::class, 'update']);
        Route::delete('/packages/{package}', [GuidePackageController::class, 'destroy']);
        Route::post('/packages/{package}/publish', [GuidePackageController::class, 'publish']);

        // Package builder — days, stops, inclusions, exclusions, add-ons, rates.
        Route::post('/packages/{package}/days', [PackageBuilderController::class, 'storeDay']);
        Route::put('/packages/{package}/days/{day}', [PackageBuilderController::class, 'updateDay']);
        Route::delete('/packages/{package}/days/{day}', [PackageBuilderController::class, 'destroyDay']);

        Route::post('/packages/{package}/days/{day}/stops', [PackageBuilderController::class, 'storeStop']);
        Route::put('/packages/{package}/days/{day}/stops/{stop}', [PackageBuilderController::class, 'updateStop']);
        Route::delete('/packages/{package}/days/{day}/stops/{stop}', [PackageBuilderController::class, 'destroyStop']);

        Route::post('/packages/{package}/inclusions', [PackageBuilderController::class, 'storeInclusion']);
        Route::put('/packages/{package}/inclusions/{inclusion}', [PackageBuilderController::class, 'updateInclusion']);
        Route::delete('/packages/{package}/inclusions/{inclusion}', [PackageBuilderController::class, 'destroyInclusion']);

        Route::post('/packages/{package}/exclusions', [PackageBuilderController::class, 'storeExclusion']);
        Route::put('/packages/{package}/exclusions/{exclusion}', [PackageBuilderController::class, 'updateExclusion']);
        Route::delete('/packages/{package}/exclusions/{exclusion}', [PackageBuilderController::class, 'destroyExclusion']);

        Route::post('/packages/{package}/addons', [PackageBuilderController::class, 'storeAddon']);
        Route::put('/packages/{package}/addons/{addon}', [PackageBuilderController::class, 'updateAddon']);
        Route::delete('/packages/{package}/addons/{addon}', [PackageBuilderController::class, 'destroyAddon']);

        Route::post('/packages/{package}/rates', [PackageBuilderController::class, 'storeRate']);
        Route::put('/packages/{package}/rates/{rate}', [PackageBuilderController::class, 'updateRate']);
        Route::delete('/packages/{package}/rates/{rate}', [PackageBuilderController::class, 'destroyRate']);
    });

    // Renter self-service.
    Route::middleware('role:renter')->prefix('renter')->group(function () {
        Route::get('/rentals', [RenterRentalController::class, 'index']);
        Route::post('/rentals', [RenterRentalController::class, 'store']);
        Route::put('/rentals/{rental}', [RenterRentalController::class, 'update']);
        Route::delete('/rentals/{rental}', [RenterRentalController::class, 'destroy']);
        Route::post('/rentals/{rental}/images', [RenterRentalController::class, 'addImage']);
        Route::delete('/rentals/{rental}/images/{image}', [RenterRentalController::class, 'deleteImage']);
        Route::get('/reviews', [ReviewController::class, 'getRenterReviews']);
    });

    // Admin management.
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users/{user}/verify', [AdminUserController::class, 'verify']);
        Route::put('/users/{user}/status', [AdminUserController::class, 'updateStatus']);

        Route::get('/commission', [CommissionController::class, 'show']);
        Route::put('/commission', [CommissionController::class, 'update']);

        // Catalog management.
        Route::post('/spots', [AdminSpotController::class, 'store']);
        Route::put('/spots/{spot}', [AdminSpotController::class, 'update']);
        Route::delete('/spots/{spot}', [AdminSpotController::class, 'destroy']);

        // Spot image management
        Route::post('/spots/{spot}/images', [AdminSpotController::class, 'addImage']);
        Route::put('/spots/{spot}/images/{image}', [AdminSpotController::class, 'updateImage']);
        Route::delete('/spots/{spot}/images/{image}', [AdminSpotController::class, 'deleteImage']);
        Route::put('/spots/reorder-images', [AdminSpotController::class, 'reorderImages']);

        Route::post('/restaurants', [AdminRestaurantController::class, 'store']);
        Route::put('/restaurants/{restaurant}', [AdminRestaurantController::class, 'update']);
        Route::delete('/restaurants/{restaurant}', [AdminRestaurantController::class, 'destroy']);

        // Restaurant image management
        Route::post('/restaurants/{restaurant}/images', [AdminRestaurantController::class, 'addImage']);
        Route::put('/restaurants/{restaurant}/images/{image}', [AdminRestaurantController::class, 'updateImage']);
        Route::delete('/restaurants/{restaurant}/images/{image}', [AdminRestaurantController::class, 'deleteImage']);
        Route::put('/restaurants/reorder-images', [AdminRestaurantController::class, 'reorderImages']);
    });
});
