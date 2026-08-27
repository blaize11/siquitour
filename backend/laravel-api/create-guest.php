<?php
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$guest = User::firstOrCreate(
    ["email" => "guest@siquitour.app"],
    [
        "name" => "John Guest",
        "password" => Hash::make("password"),
        "role" => "guest",
        "email_verified_at" => now(),
    ]
);

echo "✓ Guest account created: " . $guest->email . "\n";
