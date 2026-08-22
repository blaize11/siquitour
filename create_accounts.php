<?php
require 'backend/laravel-api/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\TourGuideProfile;
use App\Models\RenterProfile;

$app = require_once 'backend/laravel-api/bootstrap/app.php';

try {
    // Create more Tour Guides
    $guide2 = User::factory()->tourGuide()->create([
        'name' => 'Juan Dela Cruz',
        'email' => 'juan.guide@siquitour.app',
        'password' => Hash::make('password')
    ]);
    TourGuideProfile::create([
        'user_id' => $guide2->id,
        'bio' => 'Experienced guide with local expertise and knowledge of hidden gems.',
        'years_experience' => 5,
        'rate_per_pax' => 450,
        'is_verified' => true,
    ]);
    echo "✅ Created: Juan Dela Cruz (guide@juan)\n";

    $guide3 = User::factory()->tourGuide()->create([
        'name' => 'Rosa Garcia',
        'email' => 'rosa.guide@siquitour.app',
        'password' => Hash::make('password')
    ]);
    TourGuideProfile::create([
        'user_id' => $guide3->id,
        'bio' => 'Adventure specialist with certifications in extreme sports and outdoor activities.',
        'years_experience' => 6,
        'rate_per_pax' => 600,
        'is_verified' => true,
    ]);
    echo "✅ Created: Rosa Garcia (guide@rosa)\n";

    // Create more Renters
    $renter2 = User::factory()->renter()->create([
        'name' => 'Island Motors',
        'email' => 'islandmotors@siquitour.app',
        'password' => Hash::make('password')
    ]);
    RenterProfile::create([
        'user_id' => $renter2->id,
        'business_name' => 'Island Motors',
        'is_verified' => true,
    ]);
    echo "✅ Created: Island Motors (renter)\n";

    $renter3 = User::factory()->renter()->create([
        'name' => 'Siquijor Car Rentals',
        'email' => 'siqcar@siquitour.app',
        'password' => Hash::make('password')
    ]);
    RenterProfile::create([
        'user_id' => $renter3->id,
        'business_name' => 'Siquijor Car Rentals',
        'is_verified' => true,
    ]);
    echo "✅ Created: Siquijor Car Rentals (renter)\n";

    // Create regular users (tourists)
    $tourist1 = User::factory()->create([
        'name' => 'James Anderson',
        'email' => 'james.tourist@siquitour.app',
        'password' => Hash::make('password'),
        'role' => 'user'
    ]);
    echo "✅ Created: James Anderson (tourist)\n";

    $tourist2 = User::factory()->create([
        'name' => 'Sarah Wilson',
        'email' => 'sarah.tourist@siquitour.app',
        'password' => Hash::make('password'),
        'role' => 'user'
    ]);
    echo "✅ Created: Sarah Wilson (tourist)\n";

    echo "\n✅ New accounts created successfully!\n";
    echo "Total new accounts created: 5\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
