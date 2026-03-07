<?php
declare(strict_types=1);

function csrf_ensure_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

function csrf_token(): string
{
    csrf_ensure_session();

    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }

    return (string)$_SESSION['_csrf'];
}

function csrf_field(): string
{
    $t = htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8');
    return '<input type="hidden" name="_csrf" value="' . $t . '">';
}

function csrf_verify_or_die(): void
{
    csrf_ensure_session();

    $sent = $_POST['_csrf'] ?? '';
    $ok = is_string($sent) && isset($_SESSION['_csrf']) && hash_equals((string)$_SESSION['_csrf'], $sent);

    if (!$ok) {
        http_response_code(403);
        echo 'CSRF token invalide.';
        exit;
    }
}
