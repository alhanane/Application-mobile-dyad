<?php
/**
 * API Device - Enregistrer un token FCM
 * POST /api/device/register.php
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
$platform = get_str($in, 'platform', 20);
$deviceName = get_str($in, 'device_name', 100);
$deviceModel = get_str($in, 'device_model', 100);
$osVersion = get_str($in, 'os_version', 50);
$appVersion = get_str($in, 'app_version', 20);

if ($token === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'Token requis.'], 422);
}

if (!in_array($platform, ['android', 'ios', 'web'])) {
    $platform = 'web';
}

// Vérifier si le token existe déjà pour un autre parent
$stmtCheck = $pdo->prepare('SELECT parent_id FROM device_tokens WHERE token = :token');
$stmtCheck->execute([':token' => $token]);
$existingOwner = $stmtCheck->fetchColumn();

if ($existingOwner && (int)$existingOwner !== $parentId) {
    // Token déjà utilisé par un autre parent, on le supprime
    $stmtDelete = $pdo->prepare('DELETE FROM device_tokens WHERE token = :token');
    $stmtDelete->execute([':token' => $token]);
}

// Insérer ou mettre à jour le token
$stmt = $pdo->prepare(
    'INSERT INTO device_tokens (parent_id, token, platform, device_name, device_model, os_version, app_version, is_active, last_seen_at)
     VALUES (:parent_id, :token, :platform, :device_name, :device_model, :os_version, :app_version, 1, NOW())
     ON DUPLICATE KEY UPDATE 
         is_active = 1, 
         last_seen_at = NOW(),
         device_name = VALUES(device_name),
         device_model = VALUES(device_model),
         os_version = VALUES(os_version),
         app_version = VALUES(app_version)'
);
$stmt->execute([
    ':parent_id' => $parentId,
    ':token' => $token,
    ':platform' => $platform,
    ':device_name' => $deviceName ?: null,
    ':device_model' => $deviceModel ?: null,
    ':os_version' => $osVersion ?: null,
    ':app_version' => $appVersion ?: null
]);

json_response(true, ['registered' => true]);
