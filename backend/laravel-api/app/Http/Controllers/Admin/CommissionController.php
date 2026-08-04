<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionSetting;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    public function show()
    {
        return response()->json(
            CommissionSetting::where('is_active', true)->first()
        );
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $setting = CommissionSetting::where('is_active', true)->first();

        if ($setting) {
            $setting->update(['percentage' => $validated['percentage']]);
        } else {
            $setting = CommissionSetting::create([
                'percentage' => $validated['percentage'],
                'is_active' => true,
            ]);
        }

        return response()->json($setting);
    }
}
