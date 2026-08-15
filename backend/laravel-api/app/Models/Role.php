<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name', 'display_name'];

    public function userRoles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }
}
