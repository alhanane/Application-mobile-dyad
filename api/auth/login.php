<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$in = input_array();

$login = get_str($in, 'login', 64);
$password = get_str($in, 'password', 200);

if ($login === '' || $password === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'Login et mot de passe requis.'], 422);
}

if (!parent_login($login, $password)) {
    json_response(false, null, ['code' => 'invalid_credentials', 'message' => 'Identifiants invalides.'], 401);
}

$parentId = require_parent();
$pdo = db();
$stmt = $pdo->prepare('SELECT id, login, first_name, last_name, email, gsm FROM parents WHERE id = :id');
$stmt->execute([':id' => $parentId]);
$parent = $stmt->fetch() ?: [];

json_response(true, ['parent' => $parent]);
