<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/config.php';

function log_notification(PDO $pdo, string $kind, string $title, ?string $body, string $target, ?string $topic, ?int $tokensCount, ?int $statusCode, ?string $responseText): void
{
    $stmt = $pdo->prepare(
        'INSERT INTO notifications_log (kind, title, body, target, topic, tokens_count, status_code, response_text)\n'
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

/**
 * Build topic list based on targeting.
 * - all: GLOBAL_ALL_TOPIC if enabled, otherwise all level topics from table levels.
 * - level: level.<CODE>
 * - class: class.<LEVEL_CODE>.<CLASS_CODE>
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
            'SELECT c.code AS class_code, l.code AS level_code\n'
            . 'FROM classes c JOIN levels l ON l.id = c.level_id\n'
            . 'WHERE c.id = :id'
        );
        $st->execute([':id' => $classId]);
        $row = $st->fetch();
        if (!$row) return [];
        return ['class.' . $row['level_code'] . '.' . $row['class_code']];
    }

    return [];
}
