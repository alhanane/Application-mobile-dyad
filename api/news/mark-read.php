<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();
$newsId = get_int($in, 'news_id');
if ($newsId <= 0) {
    json_response(false, null, ['code' => 'validation', 'message' => 'news_id requis.'], 422);
}

$stmt = $pdo->prepare('INSERT INTO news_reads (news_id, parent_id) VALUES (:nid, :pid) ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP');
$stmt->execute([':nid' => $newsId, ':pid' => $parentId]);

json_response(true, ['marked' => true]);
