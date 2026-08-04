<?php

namespace Tests\Feature;

use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuideSelfServiceTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_guide_can_update_their_bio_and_rate(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'rate_per_pax' => 400]);

        $this->asUser($guide)->putJson('/api/guide/profile', [
            'bio' => 'Freediving instructor and island native.',
            'rate_per_pax' => 600,
            'years_experience' => 5,
        ])->assertOk()
            ->assertJsonFragment(['bio' => 'Freediving instructor and island native.']);

        $this->assertDatabaseHas('tour_guide_profiles', ['user_id' => $guide->id, 'rate_per_pax' => 600.00]);
    }

    public function test_guide_can_set_and_remove_availability(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id]);

        $store = $this->asUser($guide)->postJson('/api/guide/availability', [
            'date' => now()->addWeek()->toDateString(),
            'is_available' => true,
            'note' => 'Full day free',
        ]);
        $store->assertCreated();
        $availabilityId = $store->json('id');

        $this->asUser($guide)->getJson('/api/guide/availability')
            ->assertOk()
            ->assertJsonCount(1);

        $this->asUser($guide)->deleteJson("/api/guide/availability/{$availabilityId}")
            ->assertNoContent();
    }

    public function test_guide_cannot_delete_another_guides_availability(): void
    {
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id]);
        $otherGuide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $otherGuide->id]);

        $store = $this->asUser($guide)->postJson('/api/guide/availability', [
            'date' => now()->addWeek()->toDateString(),
            'is_available' => true,
        ]);
        $availabilityId = $store->json('id');

        $this->asUser($otherGuide)->deleteJson("/api/guide/availability/{$availabilityId}")
            ->assertForbidden();
    }
}
