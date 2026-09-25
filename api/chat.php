<?php

declare(strict_types=1);

header(
    'Content-Type: application/json; charset=utf-8'
);

header(
    'Cache-Control: no-store'
);

require_once __DIR__ .
    '/../config/config.php';


function respond(
    array $data,
    int $status = 200
): never {

    http_response_code($status);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


if (
    $_SERVER['REQUEST_METHOD'] !== 'POST'
) {
    respond(
        [
            'success' => false,
            'message' => 'POST required.'
        ],
        405
    );
}


try {

    $apiKey =
        getGeminiApiKey();

} catch (Throwable $e) {

    respond(
        [
            'success' => false,
            'message' =>
                'Gemini API key configured nahi hai.'
        ],
        500
    );
}


$raw =
    file_get_contents(
        'php://input'
    );


$input =
    json_decode(
        $raw ?: '{}',
        true
    );


if (
    !is_array($input)
) {

    respond(
        [
            'success' => false,
            'message' => 'Invalid JSON.'
        ],
        400
    );
}


$message =
    trim(
        (string) (
            $input['message'] ?? ''
        )
    );


if (
    $message === ''
) {

    respond(
        [
            'success' => false,
            'message' =>
                'Message is required.'
        ],
        400
    );
}


$model =
    trim(
        (string) (
            $input['model'] ??
            'gemini-3.8-flash'
        )
    );


if (
    $model === '' ||
    $model === 'auto'
) {
    $model =
        'gemini-3.8-flash';
}


$history =
    $input['history'] ??
    [];


if (
    !is_array($history)
) {
    $history = [];
}


$contents = [];


foreach (
    $history as $item
) {

    if (
        !is_array($item)
    ) {
        continue;
    }


    $content =
        trim(
            (string) (
                $item['content'] ??
                ''
            )
        );


    if (
        $content === ''
    ) {
        continue;
    }


    $role =
        ($item['role'] ?? 'user')
        === 'assistant'
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


$currentParts = [
    [
        'text' => $message
    ]
];


$attachments =
    $input['attachments'] ??
    [];


if (
    is_array($attachments)
) {

    foreach (
        $attachments as $file
    ) {

        if (
            !is_array($file)
        ) {
            continue;
        }


        $name =
            (string) (
                $file['name'] ??
                'file'
            );


        $mime =
            (string) (
                $file['mimeType'] ??
                ''
            );


        if (
            isset($file['text'])
        ) {

            $currentParts[] = [
                'text' =>
                    "\n\nFile: " .
                    $name .
                    "\n" .
                    mb_substr(
                        (string)
                        $file['text'],
                        0,
                        15000
                    )
            ];

            continue;
        }


        if (
            isset($file['data']) &&
            (
                str_starts_with(
                    $mime,
                    'image/'
                ) ||
                $mime ===
                    'application/pdf'
            )
        ) {

            $currentParts[] = [
                'inline_data' => [
                    'mime_type' =>
                        $mime,

                    'data' =>
                        (string)
                        $file['data']
                ]
            ];
        }
    }
}


$contents[] = [
    'role' => 'user',

    'parts' =>
        $currentParts
];


$url =
    'https://generativelanguage.googleapis.com/' .
    'v1beta/models/' .
    rawurlencode($model) .
    ':generateContent';


$payload = [

    'systemInstruction' => [
        'parts' => [
            [
                'text' =>
                    'You are Ankul AI, a helpful personal AI assistant. ' .
                    'Answer clearly and accurately. ' .
                    'When giving programming code, format it in code blocks.'
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


$ch =
    curl_init(
        $url
    );


curl_setopt_array(
    $ch,
    [
        CURLOPT_POST =>
            true,

        CURLOPT_RETURNTRANSFER =>
            true,

        CURLOPT_HTTPHEADER => [

            'Content-Type: application/json',

            'x-goog-api-key: ' .
                $apiKey
        ],

        CURLOPT_POSTFIELDS =>
            json_encode(
                $payload,
                JSON_UNESCAPED_UNICODE |
                JSON_UNESCAPED_SLASHES
            ),

        CURLOPT_CONNECTTIMEOUT =>
            15,

        CURLOPT_TIMEOUT =>
            120
    ]
);


$response =
    curl_exec(
        $ch
    );


$error =
    curl_error(
        $ch
    );


$status =
    curl_getinfo(
        $ch,
        CURLINFO_HTTP_CODE
    );


curl_close(
    $ch
);


if (
    $response === false
) {

    respond(
        [
            'success' => false,

            'message' =>
                'Gemini connection failed.',

            'error' =>
                $error
        ],
        502
    );
}


$result =
    json_decode(
        $response,
        true
    );


if (
    !is_array($result)
) {

    respond(
        [
            'success' => false,

            'message' =>
                'Invalid Gemini response.'
        ],
        502
    );
}


if (
    $status < 200 ||
    $status >= 300
) {

    respond(
        [
            'success' => false,

            'message' =>
                $result['error']['message'] ??
                'Gemini API error.',

            'model' =>
                $model
        ],
        $status >= 400
            ? $status
            : 502
    );
}


$text = '';


$parts =
    $result['candidates'][0]['content']['parts']
    ?? [];


foreach (
    $parts as $part
) {

    if (
        isset($part['text'])
    ) {

        $text .=
            (string)
            $part['text'];
    }
}


$text =
    trim($text);


if (
    $text === ''
) {

    respond(
        [
            'success' => false,

            'message' =>
                'Gemini returned an empty response.'
        ],
        502
    );
}


respond(
    [
        'success' =>
            true,

        'message' =>
            $text,

        'model' =>
            $model
    ]
);
