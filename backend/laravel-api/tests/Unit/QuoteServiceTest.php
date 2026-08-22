<?php

namespace Tests\Unit;

use App\Models\Quote;
use App\Models\TourGuideProfile;
use App\Models\TourPackage;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * QuoteServiceTest
 *
 * Tests the pricing service and quote persistence logic.
 */
class QuoteServiceTest extends TestCase
{
    use RefreshDatabase;

    private PricingService $pricingService;
    private TourPackage $package;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pricingService = app(PricingService::class);

        // Create a guide and package for testing
        $this->user = User::factory()->create();
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
            'price' => 10000.00,  // ₱10,000 for any group size
        ]);
    }

    /** @test */
    public function it_computes_quote_pricing_correctly(): void
    {
        $pricing = $this->pricingService->quotePackage($this->package, 5);

        $this->assertEquals(10000.00, $pricing['package_price']);
        $this->assertEquals(0.00, $pricing['addons_total']);
        $this->assertEquals(10000.00, $pricing['total']);
        $this->assertNotEmpty($pricing['breakdown']);
    }

    /** @test */
    public function it_validates_pax_count_within_min_max(): void
    {
        $this->expectException(ValidationException::class);

        $this->pricingService->quotePackage($this->package, 15); // Over max
    }

    /** @test */
    public function it_validates_pax_count_above_minimum(): void
    {
        $this->expectException(ValidationException::class);

        $this->pricingService->quotePackage($this->package, 0); // Below min
    }

    /** @test */
    public function it_persists_quote_to_database(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        $this->assertInstanceOf(Quote::class, $quote);
        $this->assertDatabaseHas('quotes', [
            'id' => $quote->id,
            'quotable_type' => TourPackage::class,
            'quotable_id' => $this->package->id,
            'pax' => 5,
            'tier_price' => 10000.00,
            'total' => 10000.00,
            'currency' => 'PHP',
            'issued_by_user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_sets_quote_expiry_correctly(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user,
            24  // 24 hours
        );

        $this->assertTrue($quote->expires_at->isFuture());
        // Expiry should be approximately 24 hours from now
        $diff = $quote->expires_at->diffInHours(now());
        $this->assertBetween(23, 24, $diff);
    }

    /** @test */
    public function it_detects_expired_quotes(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user,
            0  // Expires immediately
        );

        $this->assertTrue($quote->isExpired());
    }

    /** @test */
    public function it_detects_valid_quotes(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user,
            24
        );

        $this->assertFalse($quote->isExpired());
        $this->assertFalse($quote->isSuperseded());
        $this->assertTrue($quote->isValid());
    }

    /** @test */
    public function it_tracks_quote_supersession(): void
    {
        $quote1 = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        $quote2 = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        // Mark quote1 as superseded by quote2
        $quote1->update(['superseded_by_quote_id' => $quote2->id]);

        $this->assertTrue($quote1->isSuperseded());
        $this->assertFalse($quote1->isValid());
        $this->assertTrue($quote2->isValid());
    }

    /** @test */
    public function it_stores_full_breakdown_in_quote(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        $this->assertIsArray($quote->breakdown);
        $this->assertNotEmpty($quote->breakdown);
        $this->assertArrayHasKey('label', $quote->breakdown[0]);
        $this->assertArrayHasKey('amount', $quote->breakdown[0]);
    }

    /** @test */
    public function it_includes_price_basis_in_quote(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        $this->assertEquals('per_package', $quote->price_basis);
        $this->assertEquals(3, $quote->duration_days);
    }

    /** @test */
    public function it_defaults_to_current_user_if_not_specified(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5
        );

        $this->assertEquals($user->id, $quote->issued_by_user_id);
    }

    /** @test */
    public function it_polymorphically_relates_to_quotable(): void
    {
        $quote = $this->pricingService->quotePackageAndPersist(
            $this->package,
            5,
            [],
            [],
            $this->user
        );

        $this->assertInstanceOf(TourPackage::class, $quote->quotable);
        $this->assertEquals($this->package->id, $quote->quotable->id);
    }
}
