<?php
/**
 * API Notes d'Information - Marquer comme lu
 * POST /api/info/mark-read.php
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

$infoNoteId = get_int($in, 'info_note_id');

if ($infoNoteId <= 0) {
    json_response(false, null, ['code' => 'validation', 'message' => 'ID de note requis.'], 422);
}

// Insérer ou ignorer si déjà lu
$stmt = $pdo->prepare(
    'INSERT IGNORE INTO info_note_reads (info_note_id, parent_id) VALUES (:info_id, :parent_id)'
);
$stmt->execute([':info_id' => $infoNoteId, ':parent_id' => $parentId]);

json_response(true, ['marked' => true]);
