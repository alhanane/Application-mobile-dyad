<?php
/**
 * API Authentification - Infos du parent connecté
 * GET /api/auth/me.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../lib/auth.php';
require_once __DIR__ . '/../../lib/utils.php';

$parentId = get_parent_id();

if ($parentId <= 0) {
    json_response(false, null, ['code' => 'unauthorized', 'message' => 'Non connecté.'], 401);
}

$pdo = db();

// Récupérer les infos du parent
$stmt = $pdo->prepare('SELECT id, login, first_name, last_name, email, gsm, avatar_url, first_login_at, last_login_at FROM parents WHERE id = :id');
$stmt->execute([':id' => $parentId]);
$parent = $stmt->fetch();

if (!$parent) {
    logout();
    json_response(false, null, ['code' => 'not_found', 'message' => 'Compte non trouvé.'], 404);
}

// Récupérer les enfants associés
$stmtChildren = $pdo->prepare(
    'SELECT s.id, s.first_name, s.last_name, s.avatar_url, s.level_id, s.class_id, 
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
$stmtChildren->execute([':parent_id' => $parentId]);
$children = $stmtChildren->fetchAll();

json_response(true, [
    'parent' => $parent,
    'children' => $children
]);
