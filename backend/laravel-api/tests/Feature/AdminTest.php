<?php

namespace Tests\Feature;

use App\Models\CommissionSetting;
use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_admin_can_verify_a_tour_guide(): void
    {
        $admin = User::factory()->admin()->create();
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id, 'is_verified' => false]);

        $this->asUser($admin)->postJson("/api/admin/users/{$guide->id}/verify")
            ->assertOk();

        $this->assertDatabaseHas('tour_guide_profiles', ['user_id' => $guide->id, 'is_verified' => true]);
    }

    public function test_admin_can_suspend_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $renter = User::factory()->renter()->create();

        $this->asUser($admin)->putJson("/api/admin/users/{$renter->id}/status", ['status' => 'suspended'])
            ->assertOk()
            ->assertJsonFragment(['status' => 'suspended']);
    }

    public function test_admin_can_update_the_commission_percentage(): void
    {
        $admin = User::factory()->admin()->create();
        CommissionSetting::create(['percentage' => 10, 'is_active' => true]);

        $this->asUser($admin)->putJson('/api/admin/commission', ['percentage' => 15])
            ->assertOk()
            ->assertJsonFragment(['percentage' => '15.00']);
    }

    public function test_admin_can_add_a_spot(): void
    {
        $admin = User::factory()->admin()->create();

        $this->asUser($admin)->postJson('/api/admin/spots', [
            'category' => 'spot',
            'name' => 'Salagdoong Beach',
            'latitude' => 9.1075,
            'longitude' => 123.6386,
        ])->assertCreated();

        $this->assertDatabaseHas('spots', ['name' => 'Salagdoong Beach']);
    }

    public function test_non_admin_cannot_access_admin_routes(): void
    {
        $renter = User::factory()->renter()->create();

        $this->asUser($renter)->getJson('/api/admin/users')->assertForbidden();
    }
}
