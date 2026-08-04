<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'avatar_url', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isGuest(): bool
    {
        return $this->role === 'guest';
    }

    public function isTourGuide(): bool
    {
        return $this->role === 'tour_guide';
    }

    public function isRenter(): bool
    {
        return $this->role === 'renter';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function tourGuideProfile(): HasOne
    {
        return $this->hasOne(TourGuideProfile::class);
    }

    public function renterProfile(): HasOne
    {
        return $this->hasOne(RenterProfile::class);
    }

    public function availability(): HasMany
    {
        return $this->hasMany(GuideAvailability::class, 'tour_guide_id');
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class, 'renter_id');
    }

    public function bookingsAsGuest(): HasMany
    {
        return $this->hasMany(Booking::class, 'guest_id');
    }

    public function reviewsGiven(): HasMany
    {
        return $this->hasMany(Review::class, 'guest_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'tour_guide_id');
    }

    public function spotsCreated(): HasMany
    {
        return $this->hasMany(Spot::class, 'created_by');
    }

    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'followed_id');
    }

    public function blocksMade(): HasMany
    {
        return $this->hasMany(Block::class, 'blocker_id');
    }

    public function blockedBy(): HasMany
    {
        return $this->hasMany(Block::class, 'blocked_id');
    }
}
