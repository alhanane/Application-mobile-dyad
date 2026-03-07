<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');
$parentId = require_parent();
$pdo = db();

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
    'SELECT n.id, n.title, n.description, n.image_url, n.pdf_url, n.link_url, n.category, n.target_type, n.level_id, n.class_id, n.published_at,\n'
    . '  (nr.id IS NOT NULL) AS is_read\n'
    . 'FROM news n\n'
    . 'LEFT JOIN news_reads nr ON nr.news_id = n.id AND nr.parent_id = :pid\n'
    . 'WHERE (n.target_type = \'all\'\n'
    . '   OR (n.target_type = \'level\' AND n.level_id IN ' . $levelClause . ')\n'
    . '   OR (n.target_type = \'class\' AND n.class_id IN ' . $classClause . '))\n'
    . 'ORDER BY n.published_at DESC, n.id DESC\n'
    . 'LIMIT 200';

$params = array_merge([':pid' => $parentId], $levelParams, $classParams);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

json_response(true, ['items' => $items]);
