<?php
/**
 * API Demandes - Liste des demandes du parent
 * GET /api/requests/list.php
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

// Récupérer les demandes du parent avec les détails
$stmt = $pdo->prepare(
    'SELECT 
        r.id, r.status, r.message, r.subject, r.priority, r.created_at, r.updated_at, r.completed_at,
        rt.code as type_code, rt.label as type_label,
        s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
        l.code as level_code, c.code as class_code, CONCAT(l.code, "/", c.code) as student_class,
        (SELECT COUNT(*) FROM request_responses rr WHERE rr.request_id = r.id) as responses_count
     FROM requests r
     JOIN request_types rt ON rt.id = r.request_type_id
     JOIN students s ON s.id = r.student_id
     JOIN levels l ON l.id = s.level_id
     JOIN classes c ON c.id = s.class_id
     WHERE r.parent_id = :parent_id
     ORDER BY r.created_at DESC
     LIMIT 100'
);
$stmt->execute([':parent_id' => $parentId]);
$requests = $stmt->fetchAll();

// Convertir les timestamps
foreach ($requests as &$req) {
    if ($req['created_at']) {
        $req['created_at'] = strtotime($req['created_at']) * 1000;
    }
    if ($req['updated_at']) {
        $req['updated_at'] = strtotime($req['updated_at']) * 1000;
    }
    if ($req['completed_at']) {
        $req['completed_at'] = strtotime($req['completed_at']) * 1000;
    }
}

json_response(true, ['requests' => $requests]);
