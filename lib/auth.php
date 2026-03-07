<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/utils.php';

function start_session_secure(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Basic cookie hardening for Build 01
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);

    session_start();
}

function require_parent(): int
{
    start_session_secure();
    $id = (int)($_SESSION['parent_id'] ?? 0);
    if ($id <= 0) {
        json_response(false, null, ['code' => 'unauthorized', 'message' => 'Non connecté.'], 401);
    }
    return $id;
}

function require_admin(): int
{
    start_session_secure();
    $id = (int)($_SESSION['admin_id'] ?? 0);
    if ($id <= 0) {
        header('Location: /admin/login.php');
        exit;
    }
    return $id;
}

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
    return true;
}

function admin_login(string $username, string $password): bool
{
    start_session_secure();
    $pdo = db();

    $stmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE username = :u LIMIT 1');
    $stmt->execute([':u' => $username]);
    $row = $stmt->fetch();

    if (!$row) {
        return false;
    }

    if (!password_verify($password, (string)$row['password_hash'])) {
        return false;
    }

    $_SESSION['admin_id'] = (int)$row['id'];
    return true;
}

function logout_all(): void
{
    start_session_secure();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', $params['secure'] ?? false, $params['httponly'] ?? true);
    }
    session_destroy();
}
