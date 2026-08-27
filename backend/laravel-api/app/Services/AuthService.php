<?php

namespace App\Services;

use App\Models\EmailVerificationCode;
use App\Models\PasswordResetCode;
use App\Models\RenterProfile;
use App\Models\TourGuideProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Generate a 6-digit random code.
     */
    public static function generateResetCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Generate a 6-digit verification code (same format as reset code).
     */
    public static function generateVerificationCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Request a password reset code for an email.
     */
    public static function requestPasswordReset(string $email): PasswordResetCode
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            // For privacy: don't reveal whether email exists, just create a code anyway
            // This prevents account enumeration attacks
        }

        // Invalidate previous codes
        PasswordResetCode::where('email', $email)->delete();

        // Generate and store new code
        $code = self::generateResetCode();
        $expiresAt = now()->addMinutes(10);

        return PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Verify a password reset code.
     */
    public static function verifyResetCode(string $email, string $code): bool
    {
        $resetCode = PasswordResetCode::where('email', $email)
            ->where('code', $code)
            ->first();

        if (!$resetCode) {
            return false;
        }

        if (!$resetCode->isValid()) {
            return false;
        }

        $resetCode->markAsVerified();
        return true;
    }

    /**
     * Reset password after verifying code.
     */
    public static function resetPassword(string $email, string $code, string $password): User
    {
        $resetCode = PasswordResetCode::where('email', $email)
            ->where('code', $code)
            ->where('verified_at', '!=', null)
            ->first();

        if (!$resetCode) {
            throw new \Exception('Invalid or expired verification code.');
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            throw new \Exception('User not found.');
        }

        // Update password
        $user->update([
            'password' => Hash::make($password),
            'email_verified_at' => now(), // Mark email as verified upon password reset
        ]);

        // Mark code as used by deleting it
        $resetCode->delete();

        return $user;
    }

    /**
     * Request an email verification code.
     */
    public static function requestEmailVerification(string $email): EmailVerificationCode
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            // For privacy: don't reveal whether email exists, just create a code anyway
            // This prevents account enumeration attacks
        }

        // Invalidate previous codes
        EmailVerificationCode::where('email', $email)->delete();

        // Generate and store new code
        $code = self::generateVerificationCode();
        $expiresAt = now()->addMinutes(10);

        return EmailVerificationCode::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Verify an email verification code.
     */
    public static function verifyEmailCode(string $email, string $code): bool
    {
        $verificationCode = EmailVerificationCode::where('email', $email)
            ->where('code', $code)
            ->first();

        if (!$verificationCode) {
            return false;
        }

        if (!$verificationCode->isValid()) {
            return false;
        }

        $verificationCode->markAsVerified();

        // Mark user email as verified
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->update(['email_verified_at' => now()]);
        }

        return true;
    }

    /**
     * Handle Google OAuth login.
     * Creates user if not exists, or returns existing user.
     */
    public static function handleGoogleLogin(string $googleId, string $email, string $name, ?string $avatar): array
    {
        // Try to find existing user by google_id
        $user = User::where('google_id', $googleId)->first();

        if ($user) {
            return [
                'user' => $user,
                'created' => false,
            ];
        }

        // Check if email already exists (existing email/password user)
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            // Link Google account to existing user
            $existingUser->update([
                'google_id' => $googleId,
                'email_verified_at' => now(), // Google emails are verified
                'avatar_url' => $avatar ?? $existingUser->avatar_url,
            ]);

            return [
                'user' => $existingUser,
                'created' => false,
            ];
        }

        // Create new user with default role (guest)
        $user = User::create([
            'google_id' => $googleId,
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(), // Google emails are verified
            'avatar_url' => $avatar,
            'role' => 'guest', // Default role
            'status' => 'active',
            'password' => Hash::make(Str::random(32)), // Random password (not used for OAuth)
        ]);

        return [
            'user' => $user,
            'created' => true,
        ];
    }
}
