<?php
/**
 * API Contact - Informations de contact de l'école
 * GET /api/contact/get.php
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$pdo = db();

$stmt = $pdo->query('SELECT * FROM contact_info LIMIT 1');
$contact = $stmt->fetch();

if (!$contact) {
    $contact = [
        'school_name' => 'Institution AL HANANE',
        'phone' => '',
        'email' => '',
        'address' => ''
    ];
}

echo json_encode(['success' => true, 'data' => $contact]);
