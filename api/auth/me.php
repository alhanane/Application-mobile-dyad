<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');
$parentId = require_parent();
$pdo = db();

$stmt = $pdo->prepare('SELECT id, login, first_name, last_name, email, gsm, cin, home_phone, address, is_active, created_at, updated_at FROM parents WHERE id = :id');
$stmt->execute([':id' => $parentId]);
$parent = $stmt->fetch();

if (!$parent) {
    json_response(false, null, ['code' => 'not_found', 'message' => 'Parent introuvable.'], 404);
}

// Include children (useful for topic subscriptions client-side)
$st = $pdo->prepare(
    'SELECT s.id, s.first_name, s.last_name, s.level_id, s.class_id, l.code AS level_code, c.code AS class_code, c.name AS class_name\n'
    . 'FROM parent_student ps\n'
    . 'JOIN students s ON s.id = ps.student_id\n'
    . 'JOIN levels l ON l.id = s.level_id\n'
    . 'JOIN classes c ON c.id = s.class_id\n'
    . 'WHERE ps.parent_id = :pid AND s.is_active = 1'
);
$st->execute([':pid' => $parentId]);
$students = $st->fetchAll();

json_response(true, ['parent' => $parent, 'students' => $students]);
