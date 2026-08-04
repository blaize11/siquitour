<?php

namespace Database\Seeders;

use App\Models\RenterProfile;
use App\Models\Spot;
use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $guide = User::factory()->tourGuide()->create([
            'name' => 'Maria Santos',
            'email' => 'guide@siquitour.app',
        ]);
        TourGuideProfile::create([
            'user_id' => $guide->id,
            'bio' => 'Born and raised in Siquijor, showing visitors the island for 8 years.',
            'years_experience' => 8,
            'rate_per_pax' => 500,
            'is_verified' => true,
        ]);

        $renter = User::factory()->renter()->create([
            'name' => 'Siquijor Rides',
            'email' => 'renter@siquitour.app',
        ]);
        RenterProfile::create([
            'user_id' => $renter->id,
            'business_name' => 'Siquijor Rides',
            'is_verified' => true,
        ]);

        if ($admin) {
            Spot::create([
                'category' => 'spot',
                'name' => 'Cambugahay Falls',
                'description' => 'Three-tiered waterfall with a rope swing, one of Siquijor\'s most popular spots.',
                'latitude' => 9.1697,
                'longitude' => 123.5811,
                'created_by' => $admin->id,
            ]);

            Spot::create([
                'category' => 'restaurant',
                'name' => 'Kiwi Restaurant',
                'description' => 'Beachfront restaurant known for fresh seafood.',
                'latitude' => 9.2145,
                'longitude' => 123.5147,
                'created_by' => $admin->id,
            ]);
        }
    }
}
