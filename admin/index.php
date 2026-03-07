<?php
declare(strict_types=1);

require_once __DIR__ . '/_admin_common.php';

require_admin();
$pdo = db();

$stats = [
    'notes' => (int)$pdo->query('SELECT COUNT(*) FROM info_notes')->fetchColumn(),
    'news' => (int)$pdo->query('SELECT COUNT(*) FROM news')->fetchColumn(),
    'requests_pending' => (int)$pdo->query("SELECT COUNT(*) FROM requests WHERE status='pending'")->fetchColumn(),
    'requests_completed' => (int)$pdo->query("SELECT COUNT(*) FROM requests WHERE status='completed'")->fetchColumn(),
    'devices' => (int)$pdo->query('SELECT COUNT(*) FROM device_tokens WHERE is_active = 1')->fetchColumn(),
];

admin_page_start('Dashboard');

$flash = admin_flash_get();
if ($flash) {
    $kind = ($flash['kind'] ?? 'info') === 'error' ? 'error' : '';
    echo '<div class="notice ' . $kind . '">' . htmlspecialchars((string)$flash['msg'], ENT_QUOTES, 'UTF-8') . '</div>';
}

echo '<div class="grid two">';

echo '<div class="card">';
echo '<h2>Statistiques</h2>';
echo '<div class="row two">';

echo '<div class="card" style="box-shadow:none;background:rgba(91,86,246,.06)"><div class="muted">Notes</div><div style="font-size:28px;font-weight:700">' . $stats['notes'] . '</div></div>';
echo '<div class="card" style="box-shadow:none;background:rgba(124,58,237,.06)"><div class="muted">Actualités</div><div style="font-size:28px;font-weight:700">' . $stats['news'] . '</div></div>';
echo '<div class="card" style="box-shadow:none;background:rgba(245,158,11,.10)"><div class="muted">Demandes en attente</div><div style="font-size:28px;font-weight:700">' . $stats['requests_pending'] . '</div></div>';
echo '<div class="card" style="box-shadow:none;background:rgba(34,197,94,.10)"><div class="muted">Demandes traitées</div><div style="font-size:28px;font-weight:700">' . $stats['requests_completed'] . '</div></div>';

echo '</div>';
echo '<div class="notice" style="margin-top:14px">Tokens FCM actifs: <strong>' . $stats['devices'] . '</strong>. Configurez <code>FCM_SERVER_KEY</code> pour activer les notifications.</div>';

if (!FCM_SERVER_KEY) {
    echo '<div class="notice error">FCM_SERVER_KEY est vide: les envois FCM seront loggés comme non configurés.</div>';
}

echo '</div>';

echo '<div class="card">';
echo '<h2>Raccourcis</h2>';
echo '<p class="muted">Publiez rapidement une Note / Actu, ou répondez aux demandes des parents.</p>';
echo '<div class="actions">';
echo '<a class="btn primary" href="/admin/info_create.php">Créer une note</a>';
echo '<a class="btn primary" href="/admin/news_create.php">Créer une actu</a>';
echo '<a class="btn" href="/admin/requests_list.php">Voir les demandes</a>';
echo '</div>';
echo '<div class="notice" style="margin-top:14px">Astuce topics: Niveau <code>level.CP</code> / Classe <code>class.CP.A</code> — l\'app se souscrit elle-même.</div>';
echo '</div>';

echo '</div>';

admin_page_end();
