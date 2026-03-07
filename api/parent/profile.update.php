<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();

$allowed = [
    'cin' => 32,
    'gsm' => 32,
    'home_phone' => 32,
    'address' => 2000,
    'email' => 120,
];

$updates = [];
$params = [':id' => $parentId];

foreach ($allowed as $field => $max) {
    if (array_key_exists($field, $in)) {
        $val = get_str($in, $field, $max);
        if ($field === 'email' && $val !== '' && filter_var($val, FILTER_VALIDATE_EMAIL) === false) {
            json_response(false, null, ['code' => 'validation', 'message' => 'Email invalide.'], 422);
        }
        $updates[] = "$field = :$field";
        $params[":$field"] = $val === '' ? null : $val;
    }
}

if (!$updates) {
    json_response(true, ['updated' => false]);
}

$sql = 'UPDATE parents SET ' . implode(', ', $updates) . ' WHERE id = :id';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

json_response(true, ['updated' => true]);
