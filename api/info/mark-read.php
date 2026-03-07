<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();
$noteId = get_int($in, 'info_note_id');
if ($noteId <= 0) {
    json_response(false, null, ['code' => 'validation', 'message' => 'info_note_id requis.'], 422);
}

$stmt = $pdo->prepare('INSERT INTO info_note_reads (info_note_id, parent_id) VALUES (:nid, :pid) ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP');
$stmt->execute([':nid' => $noteId, ':pid' => $parentId]);

json_response(true, ['marked' => true]);
