<?php

namespace App\Policies;

use App\Models\TourPackage;
use App\Models\User;

class TourPackagePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TourPackage $tourPackage): bool
    {
        // Any authenticated user can view published packages
        if ($tourPackage->status === 'published') {
            return true;
        }

        // Guides can view their own draft/archived packages
        return $user->isTourGuide() && $user->id === $tourPackage->tour_guide_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isTourGuide();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TourPackage $tourPackage): bool
    {
        return $user->isTourGuide() && $user->id === $tourPackage->tour_guide_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TourPackage $tourPackage): bool
    {
        return $user->isTourGuide() && $user->id === $tourPackage->tour_guide_id;
    }
}
