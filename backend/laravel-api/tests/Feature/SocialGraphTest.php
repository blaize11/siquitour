<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialGraphTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_guest_can_follow_and_unfollow_a_guide(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();

        $this->asUser($guest)->postJson("/api/users/{$guide->id}/follow")
            ->assertOk()
            ->assertJson(['following' => true]);
        $this->assertDatabaseHas('follows', ['follower_id' => $guest->id, 'followed_id' => $guide->id]);

        $this->asUser($guest)->deleteJson("/api/users/{$guide->id}/follow")
            ->assertOk()
            ->assertJson(['following' => false]);
        $this->assertDatabaseMissing('follows', ['follower_id' => $guest->id, 'followed_id' => $guide->id]);
    }

    public function test_user_cannot_follow_themselves(): void
    {
        $guest = User::factory()->create();

        $this->asUser($guest)->postJson("/api/users/{$guest->id}/follow")
            ->assertStatus(422);
    }

    public function test_guest_can_block_and_unblock_a_guide(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();

        $this->asUser($guest)->postJson("/api/users/{$guide->id}/block")
            ->assertOk()
            ->assertJson(['blocked' => true]);
        $this->assertDatabaseHas('blocks', ['blocker_id' => $guest->id, 'blocked_id' => $guide->id]);

        $this->asUser($guest)->deleteJson("/api/users/{$guide->id}/block")
            ->assertOk()
            ->assertJson(['blocked' => false]);
    }
}
