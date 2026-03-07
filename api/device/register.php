<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();
$token = get_str($in, 'token', 255);
$platform = strtolower(get_str($in, 'platform', 16));

if ($token === '' || !in_array($platform, ['android','ios','web'], true)) {
    json_response(false, null, ['code' => 'validation', 'message' => 'token/platform invalides.'], 422);
}

$stmt = $pdo->prepare(
    'INSERT INTO device_tokens (parent_id, token, platform, is_active, last_seen_at)\n'
    . 'VALUES (:pid, :token, :platform, 1, NOW())\n'
    . 'ON DUPLICATE KEY UPDATE platform = VALUES(platform), is_active = 1, last_seen_at = NOW()'
);
$stmt->execute([':pid' => $parentId, ':token' => $token, ':platform' => $platform]);

json_response(true, ['registered' => true]);
