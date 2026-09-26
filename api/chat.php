<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/../config/config.php';

function respond(array $data, int $status = 200): never
{
    http_response_code($status);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}

function cleanText(
    mixed $value,
    int $maxLength = 120000
): string {
    $text =
        trim(
            (string)($value ?? '')
        );

    if (
        mb_strlen($text) >
        $maxLength
    ) {
        $text =
            mb_substr(
                $text,
                0,
                $maxLength
            );
    }

    return $text;
}

function allowedModel(
    string $model
): string {
    return match ($model) {
        'gemini-3.8-flash'
            => 'gemini-3.8-flash',

        'gemini-3.6-flash'
            => 'gemini-3.6-flash',

        'auto',
        ''
            => 'gemini-3.8-flash',

        default
            => 'gemini-3.8-flash'
    };
}

function normalizeHistory(
    mixed $history
): array {
    if (!is_array($history)) {
        return [];
    }

    $contents = [];

    foreach (
        array_slice(
            $history,
            -40
        ) as $item
    ) {
        if (!is_array($item)) {
            continue;
        }

        $content =
            cleanText(
                $item['content'] ?? '',
                50000
            );

        if ($content === '') {
            continue;
        }

        $role =
            (
                ($item['role'] ?? 'user')
                === 'assistant'
            )
                ? 'model'
                : 'user';

        $contents[] = [
            'role' => $role,

            'parts' => [
                [
                    'text' => $content
                ]
            ]
        ];
    }

    return $contents;
}

function addAttachments(
    array &$parts,
    mixed $attachments
): void {
    if (!is_array($attachments)) {
        return;
    }

    $count = 0;

    foreach (
        $attachments as $file
    ) {
        if (
            !is_array($file) ||
            $count >= 5
        ) {
            continue;
        }

        $name =
            cleanText(
                $file['name'] ??
                'file',
                180
            );

        $mime =
            cleanText(
                $file['mimeType'] ??
                '',
                120
            );

        if (
            isset($file['text'])
        ) {
            $text =
                cleanText(
                    $file['text'],
                    50000
                );

            if (
                $text !== ''
            ) {
                $parts[] = [
                    'text' =>
                        "\n\n--- Attached text file: {$name} ---\n" .
                        $text .
                        "\n--- End attached text file ---"
                ];

                $count++;
            }

            continue;
        }

        $data =
            (string)(
                $file['data'] ??
                ''
            );

        $isImage =
            str_starts_with(
                $mime,
                'image/'
            );

        $isPdf =
            $mime ===
            'application/pdf';

        if (
            $data !== '' &&
            (
                $isImage ||
                $isPdf
            )
        ) {
            $parts[] = [
                'inline_data' => [
                    'mime_type' =>
                        $mime,

                    'data' =>
                        $data
                ]
            ];

            $count++;
        }
    }
}

if (
    ($_SERVER['REQUEST_METHOD'] ?? '')
    !== 'POST'
) {
    respond(
        [
            'success' => false,
            'message' =>
                'POST request required.'
        ],
        405
    );
}

try {
    $apiKey =
        getGeminiApiKey();

} catch (Throwable $error) {

    respond(
        [
            'success' => false,
            'message' =>
                'Gemini API key is not configured on the server.'
        ],
        500
    );
}

$raw =
    file_get_contents(
        'php://input'
    );

if (
    $raw === false ||
    trim($raw) === ''
) {
    respond(
        [
            'success' => false,
            'message' =>
                'Request body is empty.'
        ],
        400
    );
}

$input =
    json_decode(
        $raw,
        true
    );

if (!is_array($input)) {
    respond(
        [
            'success' => false,
            'message' =>
                'Invalid JSON request.'
        ],
        400
    );
}

$message =
    cleanText(
        $input['message'] ?? '',
        120000
    );

$attachments =
    $input['attachments'] ??
    [];

if (
    $message === '' &&
    (
        !is_array($attachments) ||
        count($attachments) === 0
    )
) {
    respond(
        [
            'success' => false,
            'message' =>
                'Message ya attachment required hai.'
        ],
        400
    );
}

$model =
    allowedModel(
        cleanText(
            $input['model'] ??
                'gemini-3.8-flash',
            80
        )
    );

$contents =
    normalizeHistory(
        $input['history'] ??
            []
    );

$currentParts = [];

if ($message !== '') {

    $currentParts[] = [
        'text' =>
            $message
    ];

} else {

    $currentParts[] = [
        'text' =>
            'Please analyze the attached file(s) and explain the result clearly.'
    ];
}

addAttachments(
    $currentParts,
    $attachments
);

$contents[] = [
    'role' => 'user',

    'parts' =>
        $currentParts
];

$systemInstruction = <<<PROMPT
You are Ankul AI, a helpful personal AI assistant.

Core behavior:
- Answer the user's actual question directly.
- Be accurate, clear and useful.
- If the user asks for programming help, provide complete runnable code when appropriate.
- Support Java, C, C++, Python, JavaScript, HTML, CSS, PHP, SQL, Android and other common technologies.
- Put programming code inside fenced Markdown code blocks with the correct language name.
- When fixing code, explain the important fix briefly and then provide the corrected code.
- Do not invent that an external tool, website, API or file was used if it was not actually used.
- If information is uncertain or may have changed, say so instead of pretending.
- For long requests, preserve the user's important requirements and answer in organized sections.
- The user may communicate in Hindi, Hinglish or English. Reply in the language/style that best matches the user.
- Never expose, request, or reproduce server-side API keys or secrets.
PROMPT;

$payload = [
    'systemInstruction' => [
        'parts' => [
            [
                'text' =>
                    $systemInstruction
            ]
        ]
    ],

    'contents' =>
        $contents,

    'generationConfig' => [
        'temperature' =>
            0.7,

        'maxOutputTokens' =>
            8192
    ]
];

$url =
    'https://generativelanguage.googleapis.com/' .
    'v1beta/models/' .
    rawurlencode($model) .
    ':generateContent';

$encodedPayload =
    json_encode(
        $payload,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

if (
    $encodedPayload === false
) {
    respond(
        [
            'success' => false,
            'message' =>
                'Could not encode the Gemini request.'
        ],
        500
    );
}

$curl =
    curl_init($url);

if ($curl === false) {
    respond(
        [
            'success' => false,
            'message' =>
                'Server could not initialize the Gemini connection.'
        ],
        500
    );
}

curl_setopt_array(
    $curl,
    [
        CURLOPT_POST =>
            true,

        CURLOPT_RETURNTRANSFER =>
            true,

        CURLOPT_FOLLOWLOCATION =>
            false,

        CURLOPT_CONNECTTIMEOUT =>
            20,

        CURLOPT_TIMEOUT =>
            180,

        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
            'x-goog-api-key: ' .
                $apiKey
        ],

        CURLOPT_POSTFIELDS =>
            $encodedPayload
    ]
);

$response =
    curl_exec($curl);

$curlError =
    curl_error($curl);

$status =
    (int)curl_getinfo(
        $curl,
        CURLINFO_HTTP_CODE
    );

curl_close($curl);

if (
    $response === false
) {
    respond(
        [
            'success' => false,

            'message' =>
                'Gemini connection failed.',

            'error' =>
                $curlError !== ''
                    ? $curlError
                    : 'Unknown cURL error.'
        ],
        502
    );
}

$result =
    json_decode(
        $response,
        true
    );

if (!is_array($result)) {
    respond(
        [
            'success' => false,

            'message' =>
                'Gemini returned an invalid response.',

            'http_status' =>
                $status
        ],
        502
    );
}

if (
    $status < 200 ||
    $status >= 300
) {
    $apiMessage =
        $result['error']['message'] ??
        'Gemini API request failed.';

    respond(
        [
            'success' => false,

            'message' =>
                (string)$apiMessage,

            'model' =>
                $model,

            'http_status' =>
                $status
        ],
        $status >= 400
            ? $status
            : 502
    );
}

$text = '';

$candidates =
    $result['candidates'] ??
    [];

if (is_array($candidates)) {

    foreach (
        $candidates as $candidate
    ) {
        $parts =
            $candidate['content']['parts'] ??
            [];

        if (!is_array($parts)) {
            continue;
        }

        foreach (
            $parts as $part
        ) {
            if (
                isset(
                    $part['text']
                )
            ) {
                $text .=
                    (string)$part['text'];
            }
        }

        if (
            $text !== ''
        ) {
            break;
        }
    }
}

$text =
    trim($text);

if ($text === '') {

    $finishReason =
        $result['candidates'][0]['finishReason'] ??
        null;

    respond(
        [
            'success' => false,

            'message' =>
                $finishReason
                    ? "Gemini did not return text. Finish reason: {$finishReason}"
                    : 'Gemini returned an empty response.',

            'model' =>
                $model
        ],
        502
    );
}

respond(
    [
        'success' => true,

        'message' =>
            $text,

        'model' =>
            $model
    ]
);
