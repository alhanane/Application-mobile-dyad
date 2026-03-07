<?php
declare(strict_types=1);

require_once __DIR__ . '/_admin_common.php';

$pdo = db();
ensure_initial_admin($pdo);

start_session_secure();

if (!empty($_SESSION['admin_id'])) {
    header('Location: /admin/index.php');
    exit;
}

$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    csrf_verify_or_die();

    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = 'Veuillez remplir tous les champs.';
    } elseif (!admin_login($username, $password)) {
        $error = 'Identifiants invalides.';
    } else {
        header('Location: /admin/index.php');
        exit;
    }
}

admin_page_start('Connexion');

echo '<div class="grid"><div class="card">';
echo '<h2>Connexion admin</h2>';
echo '<p class="muted">Utilisez vos identifiants. Si la base est vide, un admin par défaut est créé: <strong>admin / admin123</strong> (à changer).</p>';

if ($error) {
    echo '<div class="notice error">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</div>';
}

echo '<form method="post" action="/admin/login.php">';
echo csrf_field();

echo '<div class="field"><label>Nom d\'utilisateur</label><input name="username" autocomplete="username" required></div>';
echo '<div class="field"><label>Mot de passe</label><input type="password" name="password" autocomplete="current-password" required></div>';

echo '<div class="actions"><button class="btn primary" type="submit">Se connecter</button></div>';
echo '</form>';

echo '</div></div>';

admin_page_end();
