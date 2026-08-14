<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    public function updateAvatar(Request $request)
    {
        try {
            Log::info('[Avatar Upload] Request received', [
                'has_file' => $request->hasFile('avatar'),
                'content_type' => $request->header('Content-Type'),
                'files' => $request->files->keys(),
            ]);

            $validated = $request->validate([
                'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            ]);

            $user = $request->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }

            // Delete old avatar if it exists and is from our storage
            if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
                $oldPath = str_replace(Storage::disk('public')->url('') . '/', '', $user->avatar_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = Storage::disk('public')->url($path);
            $user->save();

            Log::info('[Avatar Upload] Success', ['path' => $path]);

            return response()->json($user->fresh(), 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('[Avatar Upload] Validation error', ['errors' => $e->errors()]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('[Avatar Upload] Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            return response()->json([
                'message' => 'Avatar upload failed',
                'error' => $e->getMessage()
            ], 422);
        }
    }
}
