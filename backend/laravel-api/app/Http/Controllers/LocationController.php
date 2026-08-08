<?php

namespace App\Http\Controllers;

use App\Models\Province;
use App\Models\Municipality;
use App\Models\Barangay;
use App\Models\Landmark;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Get all provinces
    public function provinces()
    {
        $provinces = Province::select('id', 'name')->get();
        return response()->json($provinces);
    }

    // Get municipalities by province
    public function municipalities($provinceId)
    {
        $municipalities = Municipality::where('province_id', $provinceId)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        return response()->json($municipalities);
    }

    // Get barangays by municipality
    public function barangays($municipalityId)
    {
        $barangays = Barangay::where('municipality_id', $municipalityId)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();
        return response()->json($barangays);
    }

    // Get landmarks by barangay
    public function landmarks($barangayId)
    {
        $landmarks = Landmark::where('barangay_id', $barangayId)
            ->select('id', 'name', 'category', 'latitude', 'longitude')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
        return response()->json($landmarks);
    }

    // Get full location hierarchy for a barangay
    public function locationDetails($barangayId)
    {
        $barangay = Barangay::with(['municipality.province', 'landmarks'])->find($barangayId);

        if (!$barangay) {
            return response()->json(['error' => 'Barangay not found'], 404);
        }

        return response()->json($barangay);
    }
}
