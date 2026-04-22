<?php

// Test simple de la API
require_once(__DIR__ . '/vendor/autoload.php');

$app = require_once(__DIR__ . '/bootstrap/app.php');

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Simular request a /api/articles
$request = Illuminate\Http\Request::create('/api/articles?page=1&per_page=10', 'GET');

try {
    $response = $kernel->handle($request);
    echo "Status: " . $response->status() . "\n";
    echo "Content-Type: " . $response->headers->get('Content-Type') . "\n";
    echo "Body:\n";
    echo $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
