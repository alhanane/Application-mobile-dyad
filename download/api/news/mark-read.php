<?php
/**
 * API Actualités - Marquer comme lu
 * POST /api/news/mark-read.php
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

$newsId = get_int($in, 'news_id');

if ($newsId <= 0) {
    json_response(false, null, ['code' => 'validation', 'message' => 'ID d\'actualité requis.'], 422);
}

// Insérer ou ignorer si déjà lu
$stmt = $pdo->prepare(
    'INSERT IGNORE INTO news_reads (news_id, parent_id) VALUES (:news_id, :parent_id)'
);
$stmt->execute([':news_id' => $newsId, ':parent_id' => $parentId]);

json_response(true, ['marked' => true]);
