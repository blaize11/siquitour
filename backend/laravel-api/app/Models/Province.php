<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $fillable = ['name', 'psgc_code', 'region'];

    public function municipalities()
    {
        return $this->hasMany(Municipality::class);
    }
}
