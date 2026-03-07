<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');
$parentId = require_parent();
$pdo = db();

$stmt = $pdo->prepare(
    'SELECT r.id, r.student_id, r.type, r.message, r.status, r.created_at, r.updated_at,\n'
    . '  s.first_name AS student_first_name, s.last_name AS student_last_name,\n'
    . '  l.code AS level_code, c.code AS class_code,\n'
    . '  rr.id AS response_id, rr.message AS response_message, rr.attachment_url AS response_attachment_url, rr.created_at AS response_created_at\n'
    . 'FROM requests r\n'
    . 'JOIN students s ON s.id = r.student_id\n'
    . 'JOIN levels l ON l.id = s.level_id\n'
    . 'JOIN classes c ON c.id = s.class_id\n'
    . 'LEFT JOIN request_responses rr ON rr.request_id = r.id\n'
    . 'WHERE r.parent_id = :pid\n'
    . 'ORDER BY r.created_at DESC, r.id DESC\n'
    . 'LIMIT 200'
);
$stmt->execute([':pid' => $parentId]);
$items = $stmt->fetchAll();

json_response(true, ['items' => $items]);
