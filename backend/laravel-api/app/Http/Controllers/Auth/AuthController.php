<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetCodeMail;
use App\Models\RenterProfile;
use App\Models\TourGuideProfile;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['guest', 'tour_guide', 'renter'])],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            // email_verified_at is NULL - user must verify email before login
        ]);

        if ($user->role === 'tour_guide') {
            TourGuideProfile::create(['user_id' => $user->id]);
        } elseif ($user->role === 'renter') {
            RenterProfile::create(['user_id' => $user->id]);
        }

        // Send verification email
        try {
            $verificationCode = AuthService::requestEmailVerification($user->email);
            Mail::to($user->email)->send(
                new \App\Mail\EmailVerificationCodeMail($user->name, $verificationCode->code)
            );
        } catch (\Exception $e) {
            // Log error but don't fail registration
            \Log::error('Failed to send verification email', ['email' => $user->email, 'error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Account created successfully. Please verify your email to login.',
            'email' => $user->email,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if email is verified
        if ($user->email_verified_at === null) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['This account has been suspended.'],
            ]);
        }

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Handle Google OAuth login/registration.
     * Expects the mobile app to send verified Google credentials.
     */
    public function googleLogin(Request $request)
    {
        $validated = $request->validate([
            'google_id' => ['required', 'string'],
            'email' => ['required', 'email'],
            'name' => ['required', 'string', 'max:255'],
            'avatar' => ['nullable', 'url'],
        ]);

        $result = AuthService::handleGoogleLogin(
            $validated['google_id'],
            $validated['email'],
            $validated['name'],
            $validated['avatar'] ?? null
        );

        $user = $result['user'];
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Request a password reset code.
     * Sends a 6-digit code to the user's email.
     */
    public function requestPasswordReset(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $resetCode = AuthService::requestPasswordReset($validated['email']);

        // Send email with reset code
        Mail::to($validated['email'])->send(
            new PasswordResetCodeMail(
                'User', // We don't know the user's name if they don't exist
                $resetCode->code
            )
        );

        // Return privacy-safe message regardless of whether email exists
        return response()->json([
            'message' => 'If an account exists for this email, a verification code has been sent.',
        ]);
    }

    /**
     * Verify the password reset code.
     */
    public function verifyResetCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if (!AuthService::verifyResetCode($validated['email'], $validated['code'])) {
            throw ValidationException::withMessages([
                'code' => ['The verification code is incorrect or has expired.'],
            ]);
        }

        return response()->json([
            'message' => 'Code verified successfully.',
        ]);
    }

    /**
     * Reset password using verified code.
     */
    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        try {
            $user = AuthService::resetPassword(
                $validated['email'],
                $validated['code'],
                $validated['password']
            );

            $token = $user->createToken('mobile')->plainTextToken;

            return response()->json([
                'message' => 'Password reset successfully.',
                'user' => $user,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'code' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * Send email verification code.
     */
    public function sendVerificationCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $verificationCode = AuthService::requestEmailVerification($validated['email']);

        // Send email
        Mail::to($validated['email'])->send(
            new \App\Mail\EmailVerificationCodeMail('User', $verificationCode->code)
        );

        // Return privacy-safe message regardless of whether email exists
        return response()->json([
            'message' => 'If an account exists for this email, a verification code has been sent.',
        ]);
    }

    /**
     * Verify email with code.
     */
    public function verifyEmailCode(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if (!AuthService::verifyEmailCode($validated['email'], $validated['code'])) {
            throw ValidationException::withMessages([
                'code' => ['The verification code is incorrect or has expired.'],
            ]);
        }

        return response()->json([
            'message' => 'Email verified successfully. You can now log in.',
        ]);
    }

    /**
     * Resend verification email (alias for sendVerificationCode).
     */
    public function resendVerificationEmail(Request $request)
    {
        return $this->sendVerificationCode($request);
    }
}
