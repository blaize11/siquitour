<?php

namespace Tests\Feature;

use App\Models\Rental;
use App\Models\Spot;
use App\Models\TourGuideProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicBrowseTest extends TestCase
{
    use RefreshDatabase;

    public function test_guides_rentals_and_spots_are_publicly_listable(): void
    {
        $admin = User::factory()->admin()->create();
        $guide = User::factory()->tourGuide()->create();
        TourGuideProfile::create(['user_id' => $guide->id]);
        $renter = User::factory()->renter()->create();
        Rental::create(['renter_id' => $renter->id, 'type' => 'bicycle', 'title' => 'Mountain bike', 'price_per_day' => 200, 'status' => 'active']);
        Spot::create(['category' => 'spot', 'name' => 'Cambugahay Falls', 'created_by' => $admin->id]);

        $this->getJson('/api/guides')->assertOk()->assertJsonFragment(['id' => $guide->id]);
        $this->getJson('/api/rentals')->assertOk()->assertJsonFragment(['title' => 'Mountain bike']);
        $this->getJson('/api/spots')->assertOk()->assertJsonFragment(['name' => 'Cambugahay Falls']);
        $this->getJson('/api/spots?category=spot')->assertOk()->assertJsonFragment(['name' => 'Cambugahay Falls']);
    }
}
