<?php
/**
 * API Actualités - Liste
 * GET /api/news/list.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/utils.php';

$parentId = require_parent();
$pdo = db();

// Récupérer les niveaux/classes des enfants du parent
$stmtLevels = $pdo->prepare(
    'SELECT DISTINCT s.level_id, s.class_id 
     FROM parent_student ps 
     JOIN students s ON s.id = ps.student_id 
     WHERE ps.parent_id = :parent_id AND s.is_active = 1'
);
$stmtLevels->execute([':parent_id' => $parentId]);
$childrenData = $stmtLevels->fetchAll();

$levelIds = array_column($childrenData, 'level_id');
$classIds = array_column($childrenData, 'class_id');

// Construire la requête pour les actualités visibles
$sql = '
    SELECT DISTINCT 
        n.id, n.title, n.description, n.image_url, n.pdf_url, n.pdf_filename, 
        n.link_url, n.target_type, n.published_at, n.is_pinned,
        nc.label as category_label, nc.color as category_color,
        CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
        nr.read_at
    FROM news n
    LEFT JOIN news_categories nc ON nc.id = n.category_id
    LEFT JOIN news_reads nr ON nr.news_id = n.id AND nr.parent_id = :parent_id
    WHERE n.published_at <= NOW()
        AND (n.expires_at IS NULL OR n.expires_at > NOW())
        AND (
            n.target_type = "all"
';

$params = [':parent_id' => $parentId];

if (!empty($levelIds)) {
    list($inLevels, $paramsLevels) = build_in_clause($levelIds, 'lvl');
    $sql .= ' OR (n.target_type = "level" AND n.level_id IN ' . $inLevels . ')';
    $params = array_merge($params, $paramsLevels);
}

if (!empty($classIds)) {
    list($inClasses, $paramsClasses) = build_in_clause($classIds, 'cls');
    $sql .= ' OR (n.target_type = "class" AND n.class_id IN ' . $inClasses . ')';
    $params = array_merge($params, $paramsClasses);
}

$sql .= ')
    ORDER BY n.is_pinned DESC, n.published_at DESC
    LIMIT 100';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$news = $stmt->fetchAll();

// Convertir les timestamps en millisecondes
foreach ($news as &$item) {
    if ($item['published_at']) {
        $item['published_at'] = strtotime($item['published_at']) * 1000;
    }
    if ($item['read_at']) {
        $item['read_at'] = strtotime($item['read_at']) * 1000;
    }
}

json_response(true, ['news' => $news]);
