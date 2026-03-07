<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();
$token = get_str($in, 'token', 255);

if ($token === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'token requis.'], 422);
}

$stmt = $pdo->prepare('UPDATE device_tokens SET is_active = 0 WHERE parent_id = :pid AND token = :token');
$stmt->execute([':pid' => $parentId, ':token' => $token]);

json_response(true, ['unregistered' => true]);
