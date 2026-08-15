<?php

namespace Database\Factories;

use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Restaurant>
 */
class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

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
            'description' => $this->faker->paragraph(),
            'municipality' => $this->faker->randomElement(['Lazi', 'San Juan', 'Larena', 'Maria', 'Siquijor', 'Enrique Villanueva', 'San Antonio']),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'price_range' => $this->faker->randomElement(['budget', 'mid', 'premium']),
            'cuisine_tags' => $this->faker->words(3),
            'opening_time' => '09:00',
            'closing_time' => '21:00',
            'is_active' => true,
        ];
    }
}
