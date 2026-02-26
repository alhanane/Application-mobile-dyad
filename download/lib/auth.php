<?php
/**
 * Authentification - Institution AL HANANE
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/utils.php';

/**
 * Démarrer une session sécurisée
 */
function start_session_secure(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);

    session_name(SESSION_NAME);
    session_start();
}

/**
 * Exiger un parent connecté
 */
function require_parent(): int
{
    start_session_secure();
    $id = (int)($_SESSION['parent_id'] ?? 0);
    if ($id <= 0) {
        json_response(false, null, ['code' => 'unauthorized', 'message' => 'Non connecté.'], 401);
    }
    return $id;
}

/**
 * Obtenir l'ID du parent connecté (ou 0 si non connecté)
 */
function get_parent_id(): int
{
    start_session_secure();
    return (int)($_SESSION['parent_id'] ?? 0);
}

/**
 * Connexion parent
 */
function parent_login(string $login, string $password): bool
{
    start_session_secure();
    $pdo = db();

    $stmt = $pdo->prepare('SELECT id, password_hash, is_active FROM parents WHERE login = :login LIMIT 1');
    $stmt->execute([':login' => $login]);
    $row = $stmt->fetch();

    if (!$row || (int)$row['is_active'] !== 1) {
        return false;
    }

    if (!password_verify($password, (string)$row['password_hash'])) {
        return false;
    }

    $_SESSION['parent_id'] = (int)$row['id'];
    
    // Mettre à jour la date de dernière connexion
    $update = $pdo->prepare('UPDATE parents SET last_login_at = NOW() WHERE id = :id');
    $update->execute([':id' => $row['id']]);
    
    // Premier login ?
    $checkFirst = $pdo->prepare('SELECT first_login_at FROM parents WHERE id = :id');
    $checkFirst->execute([':id' => $row['id']]);
    $firstLogin = $checkFirst->fetchColumn();
    
    if ($firstLogin === null) {
        $setFirst = $pdo->prepare('UPDATE parents SET first_login_at = NOW() WHERE id = :id');
        $setFirst->execute([':id' => $row['id']]);
    }

    return true;
}

/**
 * Déconnexion
 */
function logout(): void
{
    start_session_secure();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
    }
    session_destroy();
}
