<?php
/**
 * API Notes d'Information - Liste
 * GET /api/info/list.php
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

// Construire la requête pour les notes visibles
$sql = '
    SELECT DISTINCT 
        i.id, i.title, i.description, i.image_url, i.pdf_url, i.pdf_filename, 
        i.link_url, i.target_type, i.published_at, i.is_pinned,
        ic.label as category_label, ic.color as category_color,
        CASE WHEN ir.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
        ir.read_at
    FROM info_notes i
    LEFT JOIN info_note_categories ic ON ic.id = i.category_id
    LEFT JOIN info_note_reads ir ON ir.info_note_id = i.id AND ir.parent_id = :parent_id
    WHERE i.published_at <= NOW()
        AND (i.expires_at IS NULL OR i.expires_at > NOW())
        AND (
            i.target_type = "all"
';

$params = [':parent_id' => $parentId];

if (!empty($levelIds)) {
    list($inLevels, $paramsLevels) = build_in_clause($levelIds, 'lvl');
    $sql .= ' OR (i.target_type = "level" AND i.level_id IN ' . $inLevels . ')';
    $params = array_merge($params, $paramsLevels);
}

if (!empty($classIds)) {
    list($inClasses, $paramsClasses) = build_in_clause($classIds, 'cls');
    $sql .= ' OR (i.target_type = "class" AND i.class_id IN ' . $inClasses . ')';
    $params = array_merge($params, $paramsClasses);
}

$sql .= ')
    ORDER BY i.is_pinned DESC, i.published_at DESC
    LIMIT 100';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$notes = $stmt->fetchAll();

// Convertir les timestamps en millisecondes
foreach ($notes as &$note) {
    if ($note['published_at']) {
        $note['published_at'] = strtotime($note['published_at']) * 1000;
    }
    if ($note['read_at']) {
        $note['read_at'] = strtotime($note['read_at']) * 1000;
    }
}

json_response(true, ['notes' => $notes]);
