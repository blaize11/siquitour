<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Landmark extends Model
{
    protected $fillable = [
        'name', 'description', 'barangay_id', 'category',
        'latitude', 'longitude', 'address', 'contact_number',
        'opening_hours', 'entrance_fee', 'status'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'entrance_fee' => 'decimal:2',
    ];

    public function barangay()
    {
        return $this->belongsTo(Barangay::class);
    }
}
