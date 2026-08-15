<?php

namespace Database\Factories;

use App\Models\Spot;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Spot>
 */
class SpotFactory extends Factory
{
    protected $model = Spot::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->sentence(2);

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'category' => $this->faker->randomElement(['waterfall', 'beach', 'cave', 'church', 'heritage', 'viewpoint', 'forest', 'mountain', 'adventure', 'wellness', 'camping', 'other']),
            'description' => $this->faker->paragraph(),
            'municipality' => $this->faker->randomElement(['Lazi', 'San Juan', 'Larena', 'Maria', 'Siquijor', 'Enrique Villanueva', 'San Antonio']),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'fee_type' => $this->faker->randomElement(['per_pax', 'donation', 'consumable', 'free']),
            'fee_amount' => $this->faker->optional(0.3)->numberBetween(20, 500),
            'typical_duration_minutes' => $this->faker->numberBetween(30, 180),
            'is_active' => true,
            'created_by' => User::factory()->state(['role' => 'admin']),
        ];
    }
}
