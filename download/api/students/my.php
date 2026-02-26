<?php
/**
 * API Élèves - Liste des enfants du parent
 * GET /api/students/my.php
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

// Récupérer les enfants associés au parent
$stmt = $pdo->prepare(
    'SELECT 
        s.id, s.first_name, s.last_name, s.avatar_url, s.birth_date, s.gender,
        s.level_id, s.class_id,
        l.code as level_code, l.name as level_name,
        c.code as class_code, c.name as class_name,
        CONCAT(l.code, "/", c.code) as full_class,
        ps.relationship, ps.is_primary
     FROM parent_student ps
     JOIN students s ON s.id = ps.student_id
     JOIN levels l ON l.id = s.level_id
     JOIN classes c ON c.id = s.class_id
     WHERE ps.parent_id = :parent_id AND s.is_active = 1
     ORDER BY ps.is_primary DESC, s.first_name ASC'
);
$stmt->execute([':parent_id' => $parentId]);
$students = $stmt->fetchAll();

json_response(true, ['students' => $students]);
