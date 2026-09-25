<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/config.php';

try {
    getGeminiApiKey();

    echo json_encode([
        'success' => true,
        'app' => APP_NAME,
        'version' => APP_VERSION,
        'gemini' => 'configured'
    ]);
} catch (Throwable $error) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'app' => APP_NAME,
        'version' => APP_VERSION,
        'gemini' => 'not_configured'
    ]);
}
