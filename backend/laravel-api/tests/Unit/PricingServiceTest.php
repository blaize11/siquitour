<?php

namespace Tests\Unit;

use App\Models\Restaurant;
use App\Models\Spot;
use App\Models\TourPackage;
use App\Models\TourPackageAddon;
use App\Models\TourPackageDay;
use App\Models\TourPackageRate;
use App\Models\TourPackageStop;
use App\Models\User;
use App\Models\Booking;
use App\Services\PricingService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    private PricingService $pricingService;
    private User $guide;
    private TourPackage $package;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pricingService = new PricingService();
        $this->guide = User::factory()->state(['role' => 'tour_guide'])->create();
        $this->package = TourPackage::factory()
            ->for($this->guide, 'guide')
            ->published()
            ->customizable()
            ->create(['rate_basis' => 'total_per_group', 'min_pax' => 1, 'max_pax' => 8]);

        TourPackageRate::create(['tour_package_id' => $this->package->id, 'min_pax' => 1, 'max_pax' => 1, 'price' => 1500.00]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'min_pax' => 2, 'max_pax' => 2, 'price' => 1800.00]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'min_pax' => 3, 'max_pax' => 3, 'price' => 2000.00]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'min_pax' => 4, 'max_pax' => 8, 'price' => 2500.00]);
    }

    public function test_quotes_package_for_single_pax(): void
    {
        $quote = $this->pricingService->quotePackage($this->package, 1);
        $this->assertEquals(1500.00, $quote['package_price']);
        $this->assertEquals(0.00, $quote['addons_total']);
        $this->assertEquals(0.00, $quote['onsite_fees']);
        $this->assertEquals(1500.00, $quote['total']);
    }

    public function test_quotes_package_for_two_pax(): void
    {
        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertEquals(1800.00, $quote['package_price']);
        $this->assertEquals(1800.00, $quote['total']);
    }

    public function test_quotes_package_for_pax_in_range_tier(): void
    {
        $quote = $this->pricingService->quotePackage($this->package, 5);
        $this->assertEquals(2500.00, $quote['package_price']);
        $this->assertEquals(2500.00, $quote['total']);
    }

    public function test_quotes_package_with_flat_fee_addon(): void
    {
        $addon = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Photography Package', 'pricing_mode' => 'flat_fee', 'flat_fee' => 500.00]);
        $quote = $this->pricingService->quotePackage($this->package, 2, [$addon->id]);
        $this->assertEquals(1800.00, $quote['package_price']);
        $this->assertEquals(500.00, $quote['addons_total']);
        $this->assertEquals(2300.00, $quote['total']);
    }

    public function test_quotes_package_with_per_pax_fee_addon(): void
    {
        $addon = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Meal Add-on', 'pricing_mode' => 'per_pax_fee', 'flat_fee' => 300.00]);
        $quote = $this->pricingService->quotePackage($this->package, 3, [$addon->id]);
        $this->assertEquals(2000.00, $quote['package_price']);
        $this->assertEquals(900.00, $quote['addons_total']);
        $this->assertEquals(2900.00, $quote['total']);
    }

    public function test_quotes_package_with_separate_rate_table_addon(): void
    {
        $addon = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Drone Photography', 'pricing_mode' => 'separate_rate_table', 'flat_fee' => null]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'tour_package_addon_id' => $addon->id, 'min_pax' => 1, 'max_pax' => 2, 'price' => 2500.00]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'tour_package_addon_id' => $addon->id, 'min_pax' => 3, 'max_pax' => 8, 'price' => 3500.00]);

        $quote = $this->pricingService->quotePackage($this->package, 3, [$addon->id]);
        $this->assertEquals(2000.00, $quote['package_price']);
        $this->assertEquals(3500.00, $quote['addons_total']);
        $this->assertEquals(5500.00, $quote['total']);
    }

    public function test_quotes_package_with_multiple_addons(): void
    {
        $addon1 = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Photography', 'pricing_mode' => 'flat_fee', 'flat_fee' => 500.00]);
        $addon2 = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Videography', 'pricing_mode' => 'flat_fee', 'flat_fee' => 800.00]);

        $quote = $this->pricingService->quotePackage($this->package, 2, [$addon1->id, $addon2->id]);
        $this->assertEquals(1800.00, $quote['package_price']);
        $this->assertEquals(1300.00, $quote['addons_total']);
        $this->assertEquals(3100.00, $quote['total']);
    }

    public function test_includes_spot_entrance_fees_in_quote(): void
    {
        $spot = Spot::factory()->create(['fee_type' => 'per_pax', 'fee_amount' => 50.00]);
        $day = TourPackageDay::create(['tour_package_id' => $this->package->id, 'day_number' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spot->id, 'sort_order' => 1]);

        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertEquals(1800.00, $quote['package_price']);
        $this->assertEquals(100.00, $quote['onsite_fees']);
        $this->assertEquals(1900.00, $quote['total']);
    }

    public function test_rejects_pax_count_below_minimum(): void
    {
        $this->expectException(ValidationException::class);
        $this->pricingService->quotePackage($this->package, 0);
    }

    public function test_rejects_pax_count_above_maximum(): void
    {
        $this->expectException(ValidationException::class);
        $this->pricingService->quotePackage($this->package, 10);
    }

    public function test_throws_when_rate_tier_not_found(): void
    {
        $gappyPackage = TourPackage::factory()->for($this->guide, 'guide')->create(['min_pax' => 1, 'max_pax' => 5]);
        TourPackageRate::create(['tour_package_id' => $gappyPackage->id, 'min_pax' => 1, 'max_pax' => 1, 'price' => 1500.00]);
        TourPackageRate::create(['tour_package_id' => $gappyPackage->id, 'min_pax' => 3, 'max_pax' => 5, 'price' => 2000.00]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('No pricing tier found for 2 pax');
        $this->pricingService->quotePackage($gappyPackage, 2);
    }

    public function test_throws_when_addon_not_found(): void
    {
        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Add-on 99999 not found');
        $this->pricingService->quotePackage($this->package, 2, [99999]);
    }

    public function test_throws_when_addon_rate_tier_missing(): void
    {
        $addon = TourPackageAddon::create(['tour_package_id' => $this->package->id, 'name' => 'Drone', 'pricing_mode' => 'separate_rate_table', 'flat_fee' => null]);
        TourPackageRate::create(['tour_package_id' => $this->package->id, 'tour_package_addon_id' => $addon->id, 'min_pax' => 1, 'max_pax' => 1, 'price' => 2500.00]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('No pricing tier found for 2 pax on add-on');
        $this->pricingService->quotePackage($this->package, 2, [$addon->id]);
    }

    public function test_handles_all_free_entrance_fees(): void
    {
        $spot1 = Spot::factory()->create(['fee_type' => 'free']);
        $spot2 = Spot::factory()->create(['fee_type' => 'free']);
        $day = TourPackageDay::create(['tour_package_id' => $this->package->id, 'day_number' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spot1->id, 'sort_order' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spot2->id, 'sort_order' => 2]);

        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertEquals(0.00, $quote['onsite_fees']);
    }

    public function test_handles_consumable_fees(): void
    {
        $spotConsumable = Spot::factory()->create(['fee_type' => 'consumable', 'fee_amount' => 250.00]);
        $day = TourPackageDay::create(['tour_package_id' => $this->package->id, 'day_number' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spotConsumable->id, 'sort_order' => 1]);

        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertEquals(250.00, $quote['onsite_fees']);
    }

    public function test_ignores_restaurant_entrance_fees(): void
    {
        $restaurant = Restaurant::factory()->create();
        $day = TourPackageDay::create(['tour_package_id' => $this->package->id, 'day_number' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Restaurant::class, 'stoppable_id' => $restaurant->id, 'sort_order' => 1]);

        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertEquals(0.00, $quote['onsite_fees']);
        $this->assertEquals(1800.00, $quote['total']);
    }

    public function test_builds_detailed_breakdown(): void
    {
        $quote = $this->pricingService->quotePackage($this->package, 2);
        $this->assertIsArray($quote['breakdown']);
        $this->assertGreaterThan(0, count($quote['breakdown']));
    }

    public function test_snapshots_default_itinerary(): void
    {
        $booking = Booking::factory()->create();
        $spot1 = Spot::factory()->create(['name' => 'Spot One', 'fee_type' => 'per_pax', 'fee_amount' => 50.00]);
        $spot2 = Spot::factory()->create(['name' => 'Spot Two', 'fee_type' => 'free']);

        $day = TourPackageDay::create(['tour_package_id' => $this->package->id, 'day_number' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spot1->id, 'sort_order' => 1]);
        TourPackageStop::create(['tour_package_day_id' => $day->id, 'stoppable_type' => Spot::class, 'stoppable_id' => $spot2->id, 'sort_order' => 2]);

        $this->pricingService->snapshotItinerary($booking->id, $this->package);

        $snapshots = \App\Models\BookingItineraryStop::where('booking_id', $booking->id)->get();
        $this->assertCount(2, $snapshots);
        $this->assertEquals('Spot One', $snapshots[0]->name_snapshot);
        $this->assertEquals('per_pax', $snapshots[0]->fee_type_snapshot);
        $this->assertEquals(50.00, $snapshots[0]->fee_amount_snapshot);
    }
}
