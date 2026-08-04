<?php

namespace Tests\Feature;

use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RenterSelfServiceTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_renter_can_create_update_and_delete_a_rental(): void
    {
        $renter = User::factory()->renter()->create();

        $create = $this->asUser($renter)->postJson('/api/renter/rentals', [
            'type' => 'car',
            'title' => 'Toyota Vios',
            'price_per_day' => 1500,
            'latitude' => 9.2145,
            'longitude' => 123.5147,
        ]);
        $create->assertCreated();
        $rentalId = $create->json('id');

        $this->asUser($renter)->putJson("/api/renter/rentals/{$rentalId}", ['price_per_day' => 1800])
            ->assertOk()
            ->assertJsonFragment(['price_per_day' => '1800.00']);

        $image = $this->asUser($renter)->postJson("/api/renter/rentals/{$rentalId}/images", ['url' => 'https://example.com/vios.jpg']);
        $image->assertCreated();
        $imageId = $image->json('id');

        $this->asUser($renter)->deleteJson("/api/renter/rentals/{$rentalId}/images/{$imageId}")
            ->assertNoContent();

        $this->asUser($renter)->deleteJson("/api/renter/rentals/{$rentalId}")
            ->assertNoContent();
        $this->assertDatabaseMissing('rentals', ['id' => $rentalId]);
    }

    public function test_renter_cannot_modify_another_renters_rental(): void
    {
        $renter = User::factory()->renter()->create();
        $otherRenter = User::factory()->renter()->create();
        $rental = Rental::create([
            'renter_id' => $otherRenter->id,
            'type' => 'car',
            'title' => 'Not yours',
            'price_per_day' => 1000,
            'status' => 'active',
        ]);

        $this->asUser($renter)->putJson("/api/renter/rentals/{$rental->id}", ['price_per_day' => 1])
            ->assertForbidden();
    }
}
