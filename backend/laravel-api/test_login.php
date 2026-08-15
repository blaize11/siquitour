<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->handle(
    $request = \Illuminate\Http\Request::capture()
);

use App\Models\User;

echo "=== Users in Database ===\n";
$users = User::all();
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Role: {$user->role}\n";
}

echo "\n=== Testing Login ===\n";
// Try to login as first user
if ($users->count() > 0) {
    $firstUser = $users->first();
    echo "\nTrying to login as: {$firstUser->email}\n";

    // Create a request to test login
    $response = app('Illuminate\Routing\Router')->dispatch(
        \Illuminate\Http\Request::create('/api/login', 'POST', [], [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $firstUser->email,
                'password' => 'password'
            ])
        )
    );

    echo "Status: " . $response->status() . "\n";
    echo "Response: " . $response->getContent() . "\n";
}
?>
