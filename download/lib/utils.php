<?php
/**
 * Fonctions utilitaires - Institution AL HANANE
 */

declare(strict_types=1);

/**
 * Envoyer une réponse JSON
 */
function json_response(bool $success, $data = null, ?array $error = null, int $httpCode = 200): void
{
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('Access-Control-Allow-Origin: *');

    $payload = ['success' => $success];
    if ($success) {
        $payload['data'] = $data ?? (object)[];
    } else {
        $payload['error'] = $error ?? ['code' => 'unknown', 'message' => 'Une erreur est survenue.'];
    }

    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Vérifier la méthode HTTP
 */
function require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== strtoupper($method)) {
        json_response(false, null, ['code' => 'method_not_allowed', 'message' => 'Méthode non autorisée.'], 405);
    }
}

/**
 * Lire les données d'entrée JSON
 */
function input_array(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw ?: '[]', true);
        return is_array($decoded) ? $decoded : [];
    }
    return $_POST;
}

/**
 * Récupérer une chaîne depuis un tableau
 */
function get_str(array $src, string $key, int $maxLen = 5000): string
{
    $v = $src[$key] ?? '';
    if (!is_string($v)) {
        return '';
    }
    $v = trim($v);
    if (mb_strlen($v) > $maxLen) {
        $v = mb_substr($v, 0, $maxLen);
    }
    return $v;
}

/**
 * Récupérer un entier depuis un tableau
 */
function get_int(array $src, string $key): int
{
    $v = $src[$key] ?? null;
    if ($v === null || $v === '') {
        return 0;
    }
    return (int)$v;
}

/**
 * Valider une URL
 */
function is_valid_url(?string $url): bool
{
    if ($url === null || $url === '') return true;
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Convertir en datetime MySQL
 */
function to_mysql_datetime(?string $datetimeLocal): ?string
{
    if (!$datetimeLocal) return null;
    $dt = str_replace('T', ' ', $datetimeLocal);
    if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/', $dt)) {
        return null;
    }
    if (strlen($dt) === 16) {
        $dt .= ':00';
    }
    return $dt;
}

/**
 * Créer un répertoire s'il n'existe pas
 */
function ensure_dir(string $dir): void
{
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

/**
 * Upload de fichier
 */
function upload_file(string $fieldName, string $subDir, array $allowedMime, array $allowedExt, int $maxBytes = MAX_FILE_SIZE_BYTES): ?string
{
    if (empty($_FILES[$fieldName]) || !is_array($_FILES[$fieldName])) {
        return null;
    }

    $f = $_FILES[$fieldName];
    if (($f['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if (($f['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Erreur upload.');
    }

    $size = (int)($f['size'] ?? 0);
    if ($size <= 0 || $size > $maxBytes) {
        throw new RuntimeException('Fichier trop volumineux.');
    }

    $tmp = (string)($f['tmp_name'] ?? '');
    if (!is_uploaded_file($tmp)) {
        throw new RuntimeException('Upload invalide.');
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp) ?: '';
    if (!in_array($mime, $allowedMime, true)) {
        throw new RuntimeException('Type de fichier non autorisé.');
    }

    $origName = (string)($f['name'] ?? 'file');
    $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true)) {
        throw new RuntimeException('Extension non autorisée.');
    }

    $destDir = rtrim(UPLOAD_DIR, '/') . '/' . trim($subDir, '/');
    ensure_dir($destDir);

    $fileName = bin2hex(random_bytes(16)) . '.' . $ext;
    $destPath = $destDir . '/' . $fileName;

    if (!move_uploaded_file($tmp, $destPath)) {
        throw new RuntimeException('Impossible d\'enregistrer le fichier.');
    }

    return rtrim(UPLOAD_URL_PREFIX, '/') . '/' . trim($subDir, '/') . '/' . $fileName;
}

/**
 * Construire une clause IN
 */
function build_in_clause(array $values, string $prefix = 'v'): array
{
    $placeholders = [];
    $params = [];
    $i = 0;

    foreach ($values as $v) {
        $key = ':' . $prefix . $i;
        $placeholders[] = $key;
        $params[$key] = $v;
        $i++;
    }

    if (!$placeholders) {
        return ['(NULL)', []];
    }

    return ['(' . implode(',', $placeholders) . ')', $params];
}
