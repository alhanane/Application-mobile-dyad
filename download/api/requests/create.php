<?php
/**
 * API Demandes - Créer une nouvelle demande
 * POST /api/requests/create.php
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

$studentId = get_int($in, 'student_id');
$requestTypeId = get_int($in, 'request_type_id');
$subject = get_str($in, 'subject', 200);
$message = get_str($in, 'message', 5000);

if ($studentId <= 0 || $requestTypeId <= 0 || $message === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'Veuillez remplir tous les champs obligatoires.'], 422);
}

// Vérifier que l'élève appartient bien au parent
$stmtCheck = $pdo->prepare(
    'SELECT 1 FROM parent_student WHERE parent_id = :parent_id AND student_id = :student_id'
);
$stmtCheck->execute([':parent_id' => $parentId, ':student_id' => $studentId]);

if (!$stmtCheck->fetch()) {
    json_response(false, null, ['code' => 'forbidden', 'message' => 'Cet élève n\'est pas associé à votre compte.'], 403);
}

// Créer la demande
$stmt = $pdo->prepare(
    'INSERT INTO requests (parent_id, student_id, request_type_id, subject, message, status, priority) 
     VALUES (:parent_id, :student_id, :type_id, :subject, :message, "pending", "normal")'
);
$stmt->execute([
    ':parent_id' => $parentId,
    ':student_id' => $studentId,
    ':type_id' => $requestTypeId,
    ':subject' => $subject ?: null,
    ':message' => $message
]);

$requestId = (int)$pdo->lastInsertId();

json_response(true, [
    'request_id' => $requestId,
    'message' => 'Demande créée avec succès.'
]);
