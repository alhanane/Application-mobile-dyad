<?php
declare(strict_types=1);

require_once __DIR__ . '/_admin_common.php';

require_admin();
$pdo = db();

$status = strtolower((string)($_GET['status'] ?? 'pending'));
if (!in_array($status, ['pending','completed','all'], true)) {
    $status = 'pending';
}

$where = '';
$params = [];
if ($status !== 'all') {
    $where = 'WHERE r.status = :status';
    $params[':status'] = $status;
}

$sql =
    'SELECT r.id, r.type, r.message, r.status, r.created_at,\n'
    . '  p.first_name AS parent_first_name, p.last_name AS parent_last_name, p.login AS parent_login,\n'
    . '  s.first_name AS student_first_name, s.last_name AS student_last_name,\n'
    . '  l.code AS level_code, c.code AS class_code\n'
    . 'FROM requests r\n'
    . 'JOIN parents p ON p.id = r.parent_id\n'
    . 'JOIN students s ON s.id = r.student_id\n'
    . 'JOIN levels l ON l.id = s.level_id\n'
    . 'JOIN classes c ON c.id = s.class_id\n'
    . $where . '\n'
    . 'ORDER BY r.created_at DESC, r.id DESC\n'
    . 'LIMIT 250';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$items = $stmt->fetchAll();

admin_page_start('Demandes');

$flash = admin_flash_get();
if ($flash) {
    $kind = ($flash['kind'] ?? 'info') === 'error' ? 'error' : '';
    echo '<div class="notice ' . $kind . '">' . htmlspecialchars((string)$flash['msg'], ENT_QUOTES, 'UTF-8') . '</div>';
}

echo '<div class="grid"><div class="card">';
echo '<h2>Demandes des parents</h2>';
echo '<p class="muted">Filtrez par statut et répondez avec un message + pièce jointe optionnelle. La réponse déclenche un push FCM sur les tokens du parent.</p>';

echo '<div class="actions" style="margin-bottom:8px">';
$filters = ['pending' => 'En attente', 'completed' => 'Traitées', 'all' => 'Toutes'];
foreach ($filters as $k => $lbl) {
    $cls = $status === $k ? 'btn primary' : 'btn';
    echo '<a class="' . $cls . '" href="/admin/requests_list.php?status=' . $k . '">' . $lbl . '</a>';
}

echo '</div>';

echo '<div style="overflow:auto">';
echo '<table>';
echo '<thead><tr><th>ID</th><th>Statut</th><th>Parent</th><th>Élève</th><th>Type</th><th>Date</th><th></th></tr></thead>';
echo '<tbody>';

foreach ($items as $r) {
    $id = (int)$r['id'];
    $st = (string)$r['status'];
    $tag = $st === 'completed' ? 'tag ok' : 'tag warn';
    $parent = htmlspecialchars($r['parent_first_name'] . ' ' . $r['parent_last_name'] . ' (' . $r['parent_login'] . ')', ENT_QUOTES, 'UTF-8');
    $student = htmlspecialchars($r['student_first_name'] . ' ' . $r['student_last_name'] . ' — ' . $r['level_code'] . '/' . $r['class_code'], ENT_QUOTES, 'UTF-8');
    $type = htmlspecialchars((string)$r['type'], ENT_QUOTES, 'UTF-8');
    $date = htmlspecialchars((string)$r['created_at'], ENT_QUOTES, 'UTF-8');

    echo '<tr>';
    echo '<td><strong>#' . $id . '</strong></td>';
    echo '<td><span class="' . $tag . '">' . htmlspecialchars($st, ENT_QUOTES, 'UTF-8') . '</span></td>';
    echo '<td>' . $parent . '</td>';
    echo '<td>' . $student . '</td>';
    echo '<td>' . $type . '</td>';
    echo '<td>' . $date . '</td>';
    echo '<td style="text-align:right">';
    echo '<a class="btn" href="/admin/request_reply.php?id=' . $id . '">Répondre</a>';
    echo '</td>';
    echo '</tr>';
}

if (!$items) {
    echo '<tr><td colspan="7" style="text-align:center" class="muted">Aucune demande.</td></tr>';
}

echo '</tbody></table>';
echo '</div>';

echo '</div></div>';

admin_page_end();
