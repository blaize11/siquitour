<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetCode extends Model
{
    protected $fillable = ['email', 'code', 'expires_at', 'verified_at'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Check if the code is valid (not expired and not yet verified).
     */
    public function isValid(): bool
    {
        return $this->expires_at->isFuture() && $this->verified_at === null;
    }

    /**
     * Mark code as verified.
     */
    public function markAsVerified(): void
    {
        $this->update(['verified_at' => now()]);
    }

    /**
     * Get latest valid code for email.
     */
    public static function getLatestValidCode(string $email): ?self
    {
        return self::where('email', $email)
            ->where('expires_at', '>', now())
            ->where('verified_at', null)
            ->latest()
            ->first();
    }
}
