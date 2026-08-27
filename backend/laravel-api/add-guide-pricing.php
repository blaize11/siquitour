<?php
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

use App\Models\User;
use App\Models\GuidePaxPrice;

$guide = User::where('email', 'guide@siquitour.app')->first();

if ($guide) {
    // Add pricing for different group sizes
    $prices = [
        1 => 500,
        2 => 450,
        3 => 400,
        4 => 350,
        5 => 300,
        6 => 280,
        7 => 250,
        8 => 250,
    ];
    
    foreach ($prices as $pax => $price) {
        GuidePaxPrice::updateOrCreate(
            ['tour_guide_id' => $guide->id, 'pax_quantity' => $pax],
            ['price' => $price]
        );
    }
    
    echo "✓ Pricing added for guide\n";
    echo "✓ Pax counts: 1-8 persons\n";
    echo "✓ Price range: ₱250 - ₱500 per person\n";
    echo "✓ Guide ready for guest bookings!\n";
}
