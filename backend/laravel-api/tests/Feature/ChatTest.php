<?php

namespace Tests\Feature;

use App\Models\Block;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    private function asUser(User $user): TestCase
    {
        $this->app['auth']->forgetGuards();
        $token = $user->createToken('test')->plainTextToken;

        return $this->withHeader('Authorization', "Bearer {$token}");
    }

    public function test_guest_can_start_a_conversation_and_send_a_message_to_a_guide(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();

        $conversation = $this->asUser($guest)->postJson('/api/conversations', ['user_id' => $guide->id]);
        $conversation->assertCreated();
        $conversationId = $conversation->json('id');

        $this->asUser($guest)->postJson("/api/conversations/{$conversationId}/messages", ['body' => 'Hi, are you available on Friday?'])
            ->assertCreated()
            ->assertJsonFragment(['body' => 'Hi, are you available on Friday?']);

        $this->asUser($guide)->getJson("/api/conversations/{$conversationId}/messages")
            ->assertOk()
            ->assertJsonFragment(['body' => 'Hi, are you available on Friday?']);
    }

    public function test_starting_the_same_conversation_twice_returns_the_same_conversation(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();

        $first = $this->asUser($guest)->postJson('/api/conversations', ['user_id' => $guide->id]);
        $second = $this->asUser($guide)->postJson('/api/conversations', ['user_id' => $guest->id]);

        $this->assertEquals($first->json('id'), $second->json('id'));
    }

    public function test_blocked_users_cannot_message_each_other(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();
        Block::create(['blocker_id' => $guide->id, 'blocked_id' => $guest->id]);

        $this->asUser($guest)->postJson('/api/conversations', ['user_id' => $guide->id])
            ->assertForbidden();
    }

    public function test_non_participant_cannot_read_a_conversation(): void
    {
        $guest = User::factory()->create();
        $guide = User::factory()->tourGuide()->create();
        $stranger = User::factory()->create();

        $conversation = $this->asUser($guest)->postJson('/api/conversations', ['user_id' => $guide->id]);
        $conversationId = $conversation->json('id');

        $this->asUser($stranger)->getJson("/api/conversations/{$conversationId}/messages")
            ->assertForbidden();
    }
}
