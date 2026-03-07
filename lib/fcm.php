<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

function fcm_send(array $payload): array
{
    if (!FCM_SERVER_KEY) {
        // Build 01: allow running without FCM configured (no crash).
        return ['status' => 0, 'response' => 'FCM_SERVER_KEY manquante'];
    }

    $ch = curl_init(FCM_ENDPOINT);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: key=' . FCM_SERVER_KEY,
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));

    $resp = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($resp === false) {
        $resp = 'cURL error: ' . curl_error($ch);
    }
    curl_close($ch);

    return ['status' => $status, 'response' => (string)$resp];
}

function sendToTopic(string $topic, string $title, string $body, array $data = []): array
{
    $payload = [
        'to' => '/topics/' . $topic,
        'notification' => [
            'title' => $title,
            'body' => $body,
        ],
        'data' => $data,
    ];

    return fcm_send($payload);
}

/**
 * Legacy endpoint supports up to 1000 tokens per request.
 */
function sendToTokens(array $tokens, string $title, string $body, array $data = []): array
{
    $tokens = array_values(array_unique(array_filter($tokens, fn($t) => is_string($t) && $t !== '')));
    if (!$tokens) {
        return ['status' => 0, 'response' => 'Aucun token'];
    }

    $chunks = array_chunk($tokens, 1000);
    $last = ['status' => 0, 'response' => ''];

    foreach ($chunks as $chunk) {
        $payload = [
            'registration_ids' => $chunk,
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'data' => $data,
        ];

        $last = fcm_send($payload);
    }

    return $last;
}
