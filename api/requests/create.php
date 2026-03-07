<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
$parentId = require_parent();
$pdo = db();

$in = input_array();
$studentId = get_int($in, 'student_id');
$type = strtolower(get_str($in, 'type', 20));
$message = get_str($in, 'message', 5000);

$allowedTypes = ['attestation','facture','certificat','autre'];
if ($studentId <= 0 || !in_array($type, $allowedTypes, true) || $message === '') {
    json_response(false, null, ['code' => 'validation', 'message' => 'student_id/type/message invalides.'], 422);
}

// Ensure parent has access to student
$chk = $pdo->prepare('SELECT 1 FROM parent_student WHERE parent_id = :pid AND student_id = :sid LIMIT 1');
$chk->execute([':pid' => $parentId, ':sid' => $studentId]);
if (!$chk->fetch()) {
    json_response(false, null, ['code' => 'forbidden', 'message' => 'Accès refusé à cet élève.'], 403);
}

$stmt = $pdo->prepare('INSERT INTO requests (parent_id, student_id, type, message) VALUES (:pid, :sid, :type, :msg)');
$stmt->execute([':pid' => $parentId, ':sid' => $studentId, ':type' => $type, ':msg' => $message]);
$id = (int)$pdo->lastInsertId();

json_response(true, ['id' => $id]);
