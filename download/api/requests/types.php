<?php
/**
 * API Demandes - Types de demandes disponibles
 * GET /api/requests/types.php
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

// Pas besoin d'être connecté pour récupérer les types (pour le formulaire)
// Mais on vérifie quand même l'auth pour la cohérence
$parentId = get_parent_id();

$pdo = db();

$stmt = $pdo->query(
    'SELECT id, code, label, description FROM request_types WHERE is_active = 1 ORDER BY sort_order ASC'
);
$types = $stmt->fetchAll();

json_response(true, ['types' => $types]);
