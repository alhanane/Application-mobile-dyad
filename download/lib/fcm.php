<?php
/**
 * Firebase Cloud Messaging - Institution AL HANANE
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/config.php';

/**
 * Envoyer une requête FCM
 */
function fcm_send(array $payload): array
{
    if (!FCM_SERVER_KEY) {
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

/**
 * Envoyer à un topic
 */
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
 * Envoyer à des tokens spécifiques
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

/**
 * Déterminer les topics selon le ciblage
 */
function determine_topics(PDO $pdo, string $targetType, ?int $levelId, ?int $classId): array
{
    $targetType = strtolower($targetType);

    if ($targetType === 'all') {
        if (USE_GLOBAL_ALL_TOPIC) {
            return [GLOBAL_ALL_TOPIC];
        }
        $st = $pdo->query('SELECT code FROM levels ORDER BY id ASC');
        $codes = $st->fetchAll(PDO::FETCH_COLUMN);
        return array_values(array_map(fn($c) => 'level.' . $c, $codes ?: []));
    }

    if ($targetType === 'level') {
        if (!$levelId) return [];
        $st = $pdo->prepare('SELECT code FROM levels WHERE id = :id');
        $st->execute([':id' => $levelId]);
        $code = $st->fetchColumn();
        return $code ? ['level.' . $code] : [];
    }

    if ($targetType === 'class') {
        if (!$classId) return [];
        $st = $pdo->prepare(
            'SELECT c.code AS class_code, l.code AS level_code '
            . 'FROM classes c JOIN levels l ON l.id = c.level_id '
            . 'WHERE c.id = :id'
        );
        $st->execute([':id' => $classId]);
        $row = $st->fetch();
        if (!$row) return [];
        return ['class.' . $row['level_code'] . '.' . $row['class_code']];
    }

    return [];
}

/**
 * Journaliser une notification
 */
function log_notification(PDO $pdo, string $kind, string $title, ?string $body, string $target, ?string $topic, ?int $tokensCount, ?int $statusCode, ?string $responseText): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO notifications_log (kind, title, body, target, topic, tokens_count, status_code, response_text) '
        . 'VALUES (:k, :t, :b, :target, :topic, :cnt, :sc, :rt)'
    );

    $stmt->execute([
        ':k' => $kind,
        ':t' => $title,
        ':b' => $body,
        ':target' => $target,
        ':topic' => $topic,
        ':cnt' => $tokensCount,
        ':sc' => $statusCode,
        ':rt' => $responseText,
    ]);
}
