<?php
/**
 * API Device - Désenregistrer un token FCM
 * POST /api/device/unregister.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/utils.php';

$parentId = require_parent();
$pdo = db();

require_method('POST');
$in = input_array();

$token = get_str($in, 'token', 255);

if ($token === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'Token requis.'], 422);
}

// Désactiver le token (soft delete)
$stmt = $pdo->prepare(
    'UPDATE device_tokens SET is_active = 0 WHERE token = :token AND parent_id = :parent_id'
);
$stmt->execute([':token' => $token, ':parent_id' => $parentId]);

json_response(true, ['unregistered' => true]);
