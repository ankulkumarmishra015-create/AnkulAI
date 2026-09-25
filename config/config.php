<?php

declare(strict_types=1);

const APP_NAME = 'Ankul AI';

const APP_VERSION = '1.0.0';


function getGeminiApiKey(): string
{
    $key = getenv('GEMINI_API_KEY');

    if (
        $key === false ||
        trim($key) === ''
    ) {
        throw new RuntimeException(
            'GEMINI_API_KEY is not configured.'
        );
    }

    return trim($key);
}
