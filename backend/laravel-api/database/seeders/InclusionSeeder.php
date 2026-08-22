<?php

namespace Database\Seeders;

use App\Models\Inclusion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InclusionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds the shared inclusions catalog with standard services/amenities.
     */
    public function run(): void
    {
        $inclusions = [
            ['name' => 'Transportation', 'icon' => '🚐'],
            ['name' => 'Gas', 'icon' => '⛽'],
            ['name' => 'Tour Guide', 'icon' => '👨‍🏫'],
            ['name' => 'Driver', 'icon' => '🧑‍🚗'],
            ['name' => 'Photographer', 'icon' => '📷'],
            ['name' => 'Videographer', 'icon' => '🎥'],
        ];

        foreach ($inclusions as $index => $data) {
            Inclusion::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'name' => $data['name'],
                    'icon' => $data['icon'],
                    'sort_order' => $index,
                ]
            );
        }

        echo "✅ Inclusions seeded successfully!\n";
    }
}
