<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');
$parentId = require_parent();
$pdo = db();

// Gather accessible levels/classes for this parent
$st = $pdo->prepare(
    'SELECT DISTINCT s.level_id, s.class_id\n'
    . 'FROM parent_student ps\n'
    . 'JOIN students s ON s.id = ps.student_id\n'
    . 'WHERE ps.parent_id = :pid AND s.is_active = 1'
);
$st->execute([':pid' => $parentId]);
$rows = $st->fetchAll();
$levelIds = [];
$classIds = [];
foreach ($rows as $r) {
    if (!empty($r['level_id'])) $levelIds[] = (int)$r['level_id'];
    if (!empty($r['class_id'])) $classIds[] = (int)$r['class_id'];
}
$levelIds = array_values(array_unique($levelIds));
$classIds = array_values(array_unique($classIds));

[$levelClause, $levelParams] = build_in_clause($levelIds, 'l');
[$classClause, $classParams] = build_in_clause($classIds, 'c');

$sql =
    'SELECT i.id, i.title, i.description, i.image_url, i.pdf_url, i.link_url, i.target_type, i.level_id, i.class_id, i.published_at,\n'
    . '  (inr.id IS NOT NULL) AS is_read\n'
    . 'FROM info_notes i\n'
    . 'LEFT JOIN info_note_reads inr ON inr.info_note_id = i.id AND inr.parent_id = :pid\n'
    . 'WHERE (i.target_type = \'all\'\n'
    . '   OR (i.target_type = \'level\' AND i.level_id IN ' . $levelClause . ')\n'
    . '   OR (i.target_type = \'class\' AND i.class_id IN ' . $classClause . '))\n'
    . 'ORDER BY i.published_at DESC, i.id DESC\n'
    . 'LIMIT 200';

$params = array_merge([':pid' => $parentId], $levelParams, $classParams);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

json_response(true, ['items' => $items]);
