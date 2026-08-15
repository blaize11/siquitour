<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\RestaurantImage;
use App\Models\Spot;
use App\Models\SpotImage;
use App\Models\TourGuideProfile;
use App\Models\TourPackage;
use App\Models\TourPackageAddon;
use App\Models\TourPackageDay;
use App\Models\TourPackageExclusion;
use App\Models\TourPackageInclusion;
use App\Models\TourPackageRate;
use App\Models\TourPackageStop;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourPackageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or find admin user
        $admin = User::where('role', 'admin')->first() ?? User::factory()->state(['role' => 'admin', 'name' => 'Admin User'])->create();

        // ============================================================================
        // SPOTS CATALOG
        // ============================================================================
        $spotsData = [
            ['name' => 'Pitogo Cliff', 'category' => 'viewpoint', 'fee_type' => 'per_pax', 'fee_amount' => 30, 'duration' => 60, 'municipality' => 'San Juan'],
            ['name' => 'Old Enchanted Balete Tree (with fish spa)', 'category' => 'heritage', 'fee_type' => 'per_pax', 'fee_amount' => 20, 'duration' => 45, 'municipality' => 'Maria'],
            ['name' => 'Hapitanan Broomshot', 'category' => 'heritage', 'fee_type' => 'donation', 'fee_amount' => null, 'duration' => 30, 'municipality' => 'Maria'],
            ['name' => 'Lazi Church', 'category' => 'church', 'fee_type' => 'donation', 'fee_amount' => null, 'duration' => 30, 'municipality' => 'Lazi'],
            ['name' => 'Lazi Convent', 'category' => 'heritage', 'fee_type' => 'per_pax', 'fee_amount' => 30, 'duration' => 30, 'municipality' => 'Lazi'],
            ['name' => 'Cambugahay Falls', 'category' => 'waterfall', 'fee_type' => 'per_pax', 'fee_amount' => 50, 'duration' => 90, 'municipality' => 'Maria'],
            ['name' => 'Sambulawan Cave & Underground River', 'category' => 'cave', 'fee_type' => 'per_pax', 'fee_amount' => 250, 'duration' => 120, 'municipality' => 'San Juan'],
            ['name' => 'Paliton Beach', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 20, 'duration' => 60, 'municipality' => 'San Juan'],
            ['name' => 'Olang Mini Maldives', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 100, 'duration' => 90, 'municipality' => 'Larena'],
            ['name' => 'Secret Beach (Kinapuk-an)', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 100, 'duration' => 75, 'municipality' => 'Larena'],
            ['name' => 'Salagdoong Beach', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 50, 'duration' => 60, 'municipality' => 'Larena'],
            ['name' => 'Olang Man-Made Forest', 'category' => 'forest', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 45, 'municipality' => 'Larena'],
            ['name' => 'Lagaan Falls', 'category' => 'waterfall', 'fee_type' => 'per_pax', 'fee_amount' => 50, 'duration' => 60, 'municipality' => 'San Antonio'],
            ['name' => 'La Canopee', 'category' => 'adventure', 'fee_type' => 'consumable', 'fee_amount' => 250, 'duration' => 120, 'municipality' => 'Siquijor'],
            ['name' => 'Kawayan Holiday', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 100, 'duration' => 120, 'municipality' => 'Siquijor'],
            ['name' => 'Lugnason Falls', 'category' => 'waterfall', 'fee_type' => 'per_pax', 'fee_amount' => 20, 'duration' => 45, 'municipality' => 'Enrique Villanueva'],
            ['name' => 'Tubod Marine Sanctuary (snorkeling)', 'category' => 'beach', 'fee_type' => 'per_pax', 'fee_amount' => 100, 'duration' => 90, 'municipality' => 'Enrique Villanueva'],
            ['name' => 'Kagusoan Beach', 'category' => 'beach', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 60, 'municipality' => 'Larena'],
            ['name' => '360° Mini Batanes', 'category' => 'viewpoint', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 45, 'municipality' => 'San Antonio'],
            ['name' => 'Mt. Bandilaan', 'category' => 'mountain', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 120, 'municipality' => 'San Antonio'],
            ['name' => 'Kayawan', 'category' => 'other', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 60, 'municipality' => 'Siquijor'],
            ['name' => 'Balay Pahauli (Healer)', 'category' => 'wellness', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 60, 'municipality' => 'Larena'],
            ['name' => 'Holy Mountain', 'category' => 'mountain', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 90, 'municipality' => 'Siquijor'],
            ['name' => 'Mt. Quisol', 'category' => 'mountain', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 120, 'municipality' => 'Larena'],
            ['name' => 'Cang-Agta Camping Site', 'category' => 'camping', 'fee_type' => 'free', 'fee_amount' => null, 'duration' => 60, 'municipality' => 'Maria'],
        ];

        $spots = [];
        foreach ($spotsData as $spotData) {
            $spot = Spot::firstOrCreate(
                ['slug' => Str::slug($spotData['name'])],
                [
                    'name' => $spotData['name'],
                    'category' => $spotData['category'],
                    'description' => "Beautiful {$spotData['category']} spot in {$spotData['municipality']}.",
                    'municipality' => $spotData['municipality'],
                    'latitude' => rand(-1200, -1000) / 1000 + 9, // Rough Siquijor coordinates
                    'longitude' => rand(12200, 12400) / 1000 + 123,
                    'fee_type' => $spotData['fee_type'],
                    'fee_amount' => $spotData['fee_amount'],
                    'typical_duration_minutes' => $spotData['duration'],
                    'is_active' => true,
                    'created_by' => $admin->id,
                ]
            );
            $spots[$spotData['name']] = $spot;
        }

        // ============================================================================
        // RESTAURANTS CATALOG
        // ============================================================================
        $restaurantData = [
            ['name' => 'Mai Tai Beach Bar', 'municipality' => 'San Juan', 'price_range' => 'mid', 'cuisines' => ['Filipino', 'Seafood', 'Drinks']],
            ['name' => 'Coco Cafe', 'municipality' => 'Larena', 'price_range' => 'budget', 'cuisines' => ['Filipino', 'Cafe']],
            ['name' => 'Sunset Grill', 'municipality' => 'Siquijor', 'price_range' => 'premium', 'cuisines' => ['International', 'Seafood']],
        ];

        $restaurants = [];
        foreach ($restaurantData as $restData) {
            $restaurant = Restaurant::firstOrCreate(
                ['slug' => Str::slug($restData['name'])],
                [
                    'name' => $restData['name'],
                    'description' => "Great {$restData['price_range']} restaurant in {$restData['municipality']}.",
                    'municipality' => $restData['municipality'],
                    'latitude' => rand(-1200, -1000) / 1000 + 9,
                    'longitude' => rand(12200, 12400) / 1000 + 123,
                    'price_range' => $restData['price_range'],
                    'cuisine_tags' => $restData['cuisines'],
                    'opening_time' => '09:00',
                    'closing_time' => '22:00',
                    'is_active' => true,
                ]
            );
            $restaurants[$restData['name']] = $restaurant;
        }

        // ============================================================================
        // DEMO TOUR GUIDE ACCOUNT
        // ============================================================================
        $guide = User::firstOrCreate(
            ['email' => 'demo-guide@siquitour.local'],
            [
                'name' => 'Demo Tour Guide',
                'role' => 'tour_guide',
                'phone' => '+63912345678',
                'password' => bcrypt('password'),
                'status' => 'active',
            ]
        );

        // Ensure guide has a profile
        if (!$guide->tourGuideProfile) {
            $guide->tourGuideProfile()->create([
                'bio' => 'Experienced local tour guide with expertise in island tours.',
                'years_experience' => 5,
                'rate_per_pax' => 800,
                'is_verified' => true,
                'additional_services' => 'Free diving, Fun diving, Motor rental, Photography',
            ]);
        }

        // ============================================================================
        // DEMO TOUR PACKAGE
        // ============================================================================
        $package = TourPackage::firstOrCreate(
            ['title' => 'Siquijor Island Tour', 'tour_guide_id' => $guide->id],
            [
                'description' => 'A comprehensive 3-day tour of Siquijor Island covering all major attractions, beautiful beaches, waterfalls, and cultural sites.',
                'duration_days' => 3,
                'cover_image_url' => 'https://via.placeholder.com/400x300?text=Siquijor+Island+Tour',
                'rate_basis' => 'total_per_group',
                'min_pax' => 1,
                'max_pax' => 8,
                'is_customizable' => true,
                'status' => 'published',
                'sort_order' => 1,
            ]
        );

        // ============================================================================
        // PACKAGE INCLUSIONS
        // ============================================================================
        $inclusions = [
            'Transportation',
            'Gas',
            'Tour Guide',
            'Driver',
            'Photographer',
            'Videographer',
        ];

        foreach ($inclusions as $index => $label) {
            TourPackageInclusion::firstOrCreate(
                ['tour_package_id' => $package->id, 'label' => $label],
                ['sort_order' => $index]
            );
        }

        // ============================================================================
        // PACKAGE EXCLUSIONS
        // ============================================================================
        $exclusions = [
            'Entrance and parking fees',
            'Site guide donations',
            'Meals',
            'Accommodation',
        ];

        foreach ($exclusions as $index => $label) {
            TourPackageExclusion::firstOrCreate(
                ['tour_package_id' => $package->id, 'label' => $label],
                ['sort_order' => $index]
            );
        }

        // ============================================================================
        // PACKAGE DAYS & STOPS
        // ============================================================================
        $dayStops = [
            1 => [
                'Pitogo Cliff',
                'Old Enchanted Balete Tree (with fish spa)',
                'Hapitanan Broomshot',
                'Lazi Church',
                'Lazi Convent',
                'Cambugahay Falls',
                'Sambulawan Cave & Underground River',
                'Paliton Beach',
            ],
            2 => [
                'Olang Mini Maldives',
                'Secret Beach (Kinapuk-an)',
                'Salagdoong Beach',
                'Olang Man-Made Forest',
                'Lagaan Falls',
                'La Canopee',
            ],
            3 => [
                'Kawayan Holiday',
                'Lugnason Falls',
                'Tubod Marine Sanctuary (snorkeling)',
                'Kawayan Holiday',
                'Mai Tai Beach Bar',
            ],
        ];

        foreach ($dayStops as $dayNumber => $stopNames) {
            $day = TourPackageDay::firstOrCreate(
                ['tour_package_id' => $package->id, 'day_number' => $dayNumber],
                ['title' => "Day {$dayNumber}", 'notes' => null]
            );

            foreach ($stopNames as $sortOrder => $stopName) {
                $spot = $spots[$stopName] ?? null;
                $restaurant = $restaurants[$stopName] ?? null;

                if ($spot) {
                    $note = null;
                    if ($stopName === 'Kawayan Holiday' && $sortOrder === 3) {
                        $note = 'Back here for Awra shots';
                    } elseif ($stopName === 'Mai Tai Beach Bar') {
                        $note = 'Sunset';
                    }

                    TourPackageStop::firstOrCreate(
                        [
                            'tour_package_day_id' => $day->id,
                            'stoppable_type' => Spot::class,
                            'stoppable_id' => $spot->id,
                        ],
                        [
                            'sort_order' => $sortOrder,
                            'is_optional' => false,
                            'note' => $note,
                        ]
                    );
                } elseif ($restaurant) {
                    $note = ($stopName === 'Mai Tai Beach Bar') ? 'Sunset' : null;
                    TourPackageStop::firstOrCreate(
                        [
                            'tour_package_day_id' => $day->id,
                            'stoppable_type' => Restaurant::class,
                            'stoppable_id' => $restaurant->id,
                        ],
                        [
                            'sort_order' => $sortOrder,
                            'is_optional' => false,
                            'note' => $note,
                        ]
                    );
                }
            }
        }

        // ============================================================================
        // PACKAGE ADD-ONS
        // ============================================================================
        $droneAddon = TourPackageAddon::firstOrCreate(
            ['tour_package_id' => $package->id, 'name' => 'Drone footage'],
            [
                'description' => 'Professional drone photography and video throughout the tour',
                'pricing_mode' => 'separate_rate_table',
                'flat_fee' => null,
                'sort_order' => 1,
            ]
        );

        // ============================================================================
        // BASE RATES (for package itself)
        // ============================================================================
        $baseRates = [
            ['min_pax' => 1, 'max_pax' => 1, 'price' => 1500],
            ['min_pax' => 2, 'max_pax' => 2, 'price' => 1800],
            ['min_pax' => 3, 'max_pax' => 3, 'price' => 2000],
            ['min_pax' => 4, 'max_pax' => 5, 'price' => 2500],
        ];

        foreach ($baseRates as $rateData) {
            TourPackageRate::firstOrCreate(
                [
                    'tour_package_id' => $package->id,
                    'tour_package_addon_id' => null,
                    'min_pax' => $rateData['min_pax'],
                    'max_pax' => $rateData['max_pax'],
                ],
                ['price' => $rateData['price']]
            );
        }

        // ============================================================================
        // DRONE ADDON RATES
        // ============================================================================
        $droneRates = [
            ['min_pax' => 1, 'max_pax' => 1, 'price' => 2500],
            ['min_pax' => 2, 'max_pax' => 2, 'price' => 3200],
            ['min_pax' => 3, 'max_pax' => 3, 'price' => 3500],
            ['min_pax' => 4, 'max_pax' => 8, 'price' => 4000],
        ];

        foreach ($droneRates as $rateData) {
            TourPackageRate::firstOrCreate(
                [
                    'tour_package_id' => $package->id,
                    'tour_package_addon_id' => $droneAddon->id,
                    'min_pax' => $rateData['min_pax'],
                    'max_pax' => $rateData['max_pax'],
                ],
                ['price' => $rateData['price']]
            );
        }

        // Mark optional spots (the remaining ones)
        $usedSpotIds = [];
        foreach ($dayStops as $stopNames) {
            foreach ($stopNames as $stopName) {
                if (isset($spots[$stopName])) {
                    $usedSpotIds[] = $spots[$stopName]->id;
                }
            }
        }

        // Create optional stops from unused spots
        $optionalSpots = Spot::whereNotIn('id', $usedSpotIds)->limit(5)->get();
        $lastDay = TourPackageDay::where('tour_package_id', $package->id)->latest('day_number')->first();

        foreach ($optionalSpots as $index => $spot) {
            TourPackageStop::firstOrCreate(
                [
                    'tour_package_day_id' => $lastDay->id,
                    'stoppable_type' => Spot::class,
                    'stoppable_id' => $spot->id,
                ],
                [
                    'sort_order' => 100 + $index,
                    'is_optional' => true,
                    'note' => null,
                ]
            );
        }

        echo "✅ Tour package seeding complete!\n";
        echo "Demo guide: demo-guide@siquitour.local / password\n";
        echo "Package: '{$package->title}' (published, customizable)\n";
    }
}
