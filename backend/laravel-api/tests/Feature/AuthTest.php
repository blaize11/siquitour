<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Guest',
            'email' => 'guest@example.com',
            'password' => 'password123',
            'role' => 'guest',
        ]);

        $response->assertCreated()->assertJsonStructure(['user', 'token']);
        $this->assertDatabaseHas('users', ['email' => 'guest@example.com', 'role' => 'guest']);
    }

    public function test_tour_guide_registration_creates_a_profile(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Guide',
            'email' => 'guide@example.com',
            'password' => 'password123',
            'role' => 'tour_guide',
        ]);

        $response->assertCreated();
        $user = User::where('email', 'guide@example.com')->firstOrFail();
        $this->assertNotNull($user->tourGuideProfile);
    }

    public function test_admin_role_is_rejected_on_public_registration(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Fake Admin',
            'email' => 'fakeadmin@example.com',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('users', ['email' => 'fakeadmin@example.com']);
    }

    public function test_user_can_login_and_access_protected_route(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $login = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $login->assertOk()->assertJsonStructure(['user', 'token']);
        $token = $login->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonFragment(['email' => $user->email]);
    }

    public function test_wrong_role_is_forbidden_from_role_gated_route(): void
    {
        $guest = User::factory()->create();
        $token = $guest->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/guide/availability')
            ->assertForbidden();
    }

    public function test_correct_role_can_access_role_gated_route(): void
    {
        $guide = User::factory()->tourGuide()->create();
        $token = $guide->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/guide/availability')
            ->assertOk();
    }

    public function test_logout_revokes_the_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        // The auth guard caches its resolved user for the app instance's lifetime, which
        // spans this whole test; a real second HTTP request would not carry that cache.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertUnauthorized();
    }
}
