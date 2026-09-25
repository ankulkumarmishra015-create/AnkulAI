<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Ankul AI Configuration
|--------------------------------------------------------------------------
| IMPORTANT:
| Never put your real Gemini API key directly into GitHub.
| Set it on your hosting/server as an environment variable.
|--------------------------------------------------------------------------
*/

const APP_NAME = 'Ankul AI';
const APP_VERSION = '1.0.0';

function getGeminiApiKey(): string
{
    $key = getenv('GEMINI_API_KEY');

    if ($key === false || trim($key) === '') {
        throw new RuntimeException(
            'Gemini API key is not configured on the server.'
        );
    }

    return trim($key);
}
