<?php
/**
 * API Demandes - Détails et réponses
 * GET /api/requests/detail.php?id=XXX
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

$requestId = get_int($_GET, 'id');

if ($requestId <= 0) {
    json_response(false, null, ['code' => 'validation', 'message' => 'ID de demande requis.'], 422);
}

// Récupérer la demande
$stmt = $pdo->prepare(
    'SELECT 
        r.id, r.status, r.message, r.subject, r.priority, r.created_at, r.updated_at, r.completed_at,
        rt.code as type_code, rt.label as type_label,
        s.id as student_id, s.first_name as student_first_name, s.last_name as student_last_name,
        l.code as level_code, c.code as class_code, CONCAT(l.code, "/", c.code) as student_class
     FROM requests r
     JOIN request_types rt ON rt.id = r.request_type_id
     JOIN students s ON s.id = r.student_id
     JOIN levels l ON l.id = s.level_id
     JOIN classes c ON c.id = s.class_id
     WHERE r.id = :id AND r.parent_id = :parent_id'
);
$stmt->execute([':id' => $requestId, ':parent_id' => $parentId]);
$request = $stmt->fetch();

if (!$request) {
    json_response(false, null, ['code' => 'not_found', 'message' => 'Demande non trouvée.'], 404);
}

// Récupérer les réponses
$stmtResponses = $pdo->prepare(
    'SELECT id, message, attachment_url, attachment_filename, created_at
     FROM request_responses
     WHERE request_id = :request_id
     ORDER BY created_at ASC'
);
$stmtResponses->execute([':request_id' => $requestId]);
$responses = $stmtResponses->fetchAll();

// Convertir les timestamps
if ($request['created_at']) {
    $request['created_at'] = strtotime($request['created_at']) * 1000;
}
if ($request['updated_at']) {
    $request['updated_at'] = strtotime($request['updated_at']) * 1000;
}
if ($request['completed_at']) {
    $request['completed_at'] = strtotime($request['completed_at']) * 1000;
}

foreach ($responses as &$resp) {
    if ($resp['created_at']) {
        $resp['created_at'] = strtotime($resp['created_at']) * 1000;
    }
}

json_response(true, [
    'request' => $request,
    'responses' => $responses
]);
