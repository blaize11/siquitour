<?php

namespace Database\Seeders;

use App\Models\CommissionSetting;
use Illuminate\Database\Seeder;

class CommissionSettingSeeder extends Seeder
{
    public function run(): void
    {
        if (! CommissionSetting::where('is_active', true)->exists()) {
            CommissionSetting::create([
                'percentage' => 10.00,
                'is_active' => true,
            ]);
        }
    }
}
