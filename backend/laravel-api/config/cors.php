<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',      // Admin Dashboard
        'http://localhost:8081',      // Mobile App Web
        'http://127.0.0.1:3000',      // Admin (alternate)
        'http://127.0.0.1:8081',      // Mobile App (alternate)
        'http://localhost:8000',      // API itself
    ],

    'allowed_origins_patterns' => [
        '#^http://localhost.*#',
        '#^http://127\.0\.0\.1.*#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
