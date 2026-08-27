<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:2000'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:80'],
            'phone' => ['nullable', 'string', 'max:30'],
            'avatar_url' => ['nullable', 'string', 'max:2048'],
        ]);

        $user = $request->user();
        $user->fill($request->only(['phone', 'avatar_url']))->save();
        $user->tourGuideProfile()->update($request->only(['bio', 'years_experience']));

        return response()->json($user->fresh('tourGuideProfile'));
    }
}
