<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');
$parentId = require_parent();
$pdo = db();

$stmt = $pdo->prepare('SELECT first_name, last_name, cin, gsm, home_phone, address, email FROM parents WHERE id = :id');
$stmt->execute([':id' => $parentId]);
$row = $stmt->fetch();

if (!$row) {
    json_response(false, null, ['code' => 'not_found', 'message' => 'Parent introuvable.'], 404);
}

json_response(true, ['profile' => $row]);
