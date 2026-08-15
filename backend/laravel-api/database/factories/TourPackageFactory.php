<?php

namespace Database\Factories;

use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TourPackage>
 */
class TourPackageFactory extends Factory
{
    protected $model = TourPackage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tour_guide_id' => User::factory()->state(['role' => 'tour_guide']),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'duration_days' => $this->faker->numberBetween(1, 7),
            'cover_image_url' => $this->faker->imageUrl(),
            'rate_basis' => $this->faker->randomElement(['total_per_group', 'per_pax']),
            'min_pax' => 1,
            'max_pax' => $this->faker->numberBetween(5, 20),
            'is_customizable' => $this->faker->boolean(70),
            'status' => 'draft',
            'sort_order' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'published',
        ]);
    }

    public function customizable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_customizable' => true,
        ]);
    }

    public function notCustomizable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_customizable' => false,
        ]);
    }
}
