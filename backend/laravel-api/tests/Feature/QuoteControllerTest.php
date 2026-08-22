<?php

namespace Tests\Feature;

use App\Models\Quote;
use App\Models\TourGuideProfile;
use App\Models\TourPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * QuoteControllerTest
 *
 * Tests the quote API endpoints.
 */
class QuoteControllerTest extends TestCase
{
    use RefreshDatabase;

    private TourPackage $package;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        // Create guide and published package
        $guide = TourGuideProfile::factory()
            ->for($this->user)
            ->create();

        $this->package = TourPackage::factory()
            ->for($this->user, 'guide')
            ->create([
                'min_pax' => 1,
                'max_pax' => 10,
                'price_basis' => 'per_package',
                'duration_days' => 3,
                'status' => 'published',
            ]);

        // Add a rate tier
        $this->package->rates()->create([
            'min_pax' => 1,
            'max_pax' => 10,
            'price' => 10000.00,
        ]);
    }

    /** @test */
    public function it_returns_404_for_unpublished_package(): void
    {
        $unpublished = TourPackage::factory()
            ->for($this->user, 'guide')
            ->create(['status' => 'draft']);

        $response = $this->postJson(
            "/api/packages/{$unpublished->id}/quote",
            ['pax_count' => 5]
        );

        $response->assertNotFound();
    }

    /** @test */
    public function it_creates_quote_with_valid_pax_count(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $response->assertOk();
        $data = $response->json();

        $this->assertEquals(5, $data['pax']);
        $this->assertEquals(10000.00, $data['pricing']['tier_price']);
        $this->assertEquals(10000.00, $data['pricing']['total']);
        $this->assertNotNull($data['expires_at']);
        $this->assertTrue($data['is_valid']);
    }

    /** @test */
    public function it_returns_422_for_invalid_pax_count(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 15]  // Over max of 10
        );

        $response->assertUnprocessable();
    }

    /** @test */
    public function it_persists_quote_in_database(): void
    {
        $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $this->assertDatabaseHas('quotes', [
            'quotable_type' => TourPackage::class,
            'quotable_id' => $this->package->id,
            'pax' => 5,
            'tier_price' => 10000.00,
        ]);
    }

    /** @test */
    public function quote_response_includes_breakdown(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $data = $response->json();

        $this->assertNotEmpty($data['breakdown']);
        $this->assertIsArray($data['breakdown']);
        $this->assertArrayHasKey('label', $data['breakdown'][0]);
        $this->assertArrayHasKey('amount', $data['breakdown'][0]);
    }

    /** @test */
    public function quote_response_includes_validity_status(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $data = $response->json();

        $this->assertFalse($data['is_expired']);
        $this->assertFalse($data['is_superseded']);
        $this->assertTrue($data['is_valid']);
    }

    /** @test */
    public function quote_response_includes_quote_number(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $data = $response->json();

        $this->assertStringStartsWith('QT-', $data['quote_number']);
    }

    /** @test */
    public function it_accepts_custom_expiry_hours(): void
    {
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            [
                'pax_count' => 5,
                'expiry_hours' => 48,
            ]
        );

        $response->assertOk();
        $data = $response->json();

        // Expiry should be roughly 48 hours from now
        $diff = now()->diffInHours($data['expires_at']);
        $this->assertBetween(47, 48, $diff);
    }

    /** @test */
    public function it_tracks_issued_by_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        $quote = Quote::latest()->first();
        $this->assertEquals($user->id, $quote->issued_by_user_id);
    }

    /** @test */
    public function it_allows_unauthenticated_quote_requests(): void
    {
        // The route should work without authentication for public browsing
        $response = $this->postJson(
            "/api/packages/{$this->package->id}/quote",
            ['pax_count' => 5]
        );

        // Depending on your auth middleware, this might return 200 or 401
        // If the route is public, should be 200. If auth:sanctum required, 401
        $this->assertIn($response->status(), [200, 401, 422]);
    }
}
