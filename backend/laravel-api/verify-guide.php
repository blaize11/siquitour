<?php
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

use App\Models\User;
use App\Models\TourGuideProfile;

// Find the guide user (BlaizeTour / Maria Santos)
$guide = User::where('email', 'guide@siquitour.app')->first();

if ($guide) {
    // Update verification status to approved
    $guide->tourGuideProfile()->update([
        'verification_status' => 'approved',
        'is_verified' => true,
    ]);
    
    echo "✓ Guide verified: " . $guide->name . "\n";
    echo "✓ Email: " . $guide->email . "\n";
    echo "✓ Status: " . $guide->tourGuideProfile->verification_status . "\n";
    echo "✓ Ready for bookings from guests!\n";
} else {
    echo "✗ Guide account not found\n";
}
