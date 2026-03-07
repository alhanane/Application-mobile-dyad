<?php
declare(strict_types=1);

require_once __DIR__ . '/_admin_common.php';

$adminId = require_admin();
$pdo = db();

$requestId = (int)($_GET['id'] ?? 0);
if ($requestId <= 0) {
    admin_flash_set('error', 'ID de demande invalide.');
    header('Location: /admin/requests_list.php');
    exit;
}

$stmt = $pdo->prepare(
    'SELECT r.id, r.parent_id, r.student_id, r.type, r.message, r.status, r.created_at,\n'
    . '  p.first_name AS parent_first_name, p.last_name AS parent_last_name, p.login AS parent_login,\n'
    . '  s.first_name AS student_first_name, s.last_name AS student_last_name, l.code AS level_code, c.code AS class_code\n'
    . 'FROM requests r\n'
    . 'JOIN parents p ON p.id = r.parent_id\n'
    . 'JOIN students s ON s.id = r.student_id\n'
    . 'JOIN levels l ON l.id = s.level_id\n'
    . 'JOIN classes c ON c.id = s.class_id\n'
    . 'WHERE r.id = :id'
);
$stmt->execute([':id' => $requestId]);
$req = $stmt->fetch();

if (!$req) {
    admin_flash_set('error', 'Demande introuvable.');
    header('Location: /admin/requests_list.php');
    exit;
}

// Check existing response
$existing = $pdo->prepare('SELECT id, message, attachment_url, created_at FROM request_responses WHERE request_id = :id ORDER BY id DESC LIMIT 1');
$existing->execute([':id' => $requestId]);
$respRow = $existing->fetch();

$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    try {
        csrf_verify_or_die();

        $message = trim((string)($_POST['message'] ?? ''));
        if ($message === '') {
            throw new RuntimeException('Message requis.');
        }

        // Attachment upload (optional)
        $attachmentUrl = null;
        if (!empty($_FILES['attachment']) && is_array($_FILES['attachment']) && (int)($_FILES['attachment']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
            // Allow PDF + common images
            $attachmentUrl = upload_file('attachment', 'request_attachments', [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp',
            ], ['pdf','jpg','jpeg','png','webp']);
        }

        $pdo->beginTransaction();

        $ins = $pdo->prepare('INSERT INTO request_responses (request_id, admin_id, message, attachment_url) VALUES (:rid,:aid,:msg,:att)');
        $ins->execute([':rid' => $requestId, ':aid' => $adminId, ':msg' => $message, ':att' => $attachmentUrl]);

        $upd = $pdo->prepare("UPDATE requests SET status='completed' WHERE id = :rid");
        $upd->execute([':rid' => $requestId]);

        $pdo->commit();

        // Notify parent via tokens
        $t = $pdo->prepare('SELECT token FROM device_tokens WHERE parent_id = :pid AND is_active = 1');
        $t->execute([':pid' => (int)$req['parent_id']]);
        $tokens = $t->fetchAll(PDO::FETCH_COLUMN);

        $titleNotif = 'Réponse à votre demande';
        $bodyNotif = 'Votre demande #' . (int)$req['id'] . ' a reçu une réponse.';
        $data = ['kind' => 'request_response', 'id' => (int)$req['id'], 'deeplink' => '/requests/' . (int)$req['id']];

        $res = sendToTokens($tokens ?: [], $titleNotif, $bodyNotif, $data);
        log_notification($pdo, 'request_response', $titleNotif, $bodyNotif, 'tokens', null, is_array($tokens) ? count($tokens) : 0, $res['status'] ?? null, $res['response'] ?? null);

        admin_flash_set('info', 'Réponse enregistrée et notification envoyée à ' . count($tokens ?: []) . ' token(s).');
        header('Location: /admin/requests_list.php?status=pending');
        exit;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error = $e->getMessage();
    }
}

admin_page_start('Répondre');

echo '<div class="grid two">';

echo '<div class="card">';
echo '<h2>Demande #' . (int)$req['id'] . '</h2>';
echo '<div class="notice" style="background:rgba(30,27,75,.03)">';
echo '<div class="muted">Parent</div><div><strong>' . htmlspecialchars($req['parent_first_name'] . ' ' . $req['parent_last_name'], ENT_QUOTES, 'UTF-8') . '</strong> <span class="muted">(' . htmlspecialchars($req['parent_login'], ENT_QUOTES, 'UTF-8') . ')</span></div>';
echo '<div style="height:8px"></div>';
echo '<div class="muted">Élève</div><div>' . htmlspecialchars($req['student_first_name'] . ' ' . $req['student_last_name'] . ' — ' . $req['level_code'] . '/' . $req['class_code'], ENT_QUOTES, 'UTF-8') . '</div>';
echo '<div style="height:8px"></div>';
echo '<div class="muted">Type</div><div>' . htmlspecialchars((string)$req['type'], ENT_QUOTES, 'UTF-8') . '</div>';
echo '<div style="height:8px"></div>';
echo '<div class="muted">Statut</div><div><span class="tag ' . ((string)$req['status'] === 'completed' ? 'ok' : 'warn') . '">' . htmlspecialchars((string)$req['status'], ENT_QUOTES, 'UTF-8') . '</span></div>';
echo '</div>';

echo '<div class="card" style="box-shadow:none;background:rgba(255,255,255,.6)">';
echo '<div class="muted" style="margin-bottom:6px">Message du parent</div>';
echo '<div style="white-space:pre-wrap">' . htmlspecialchars((string)$req['message'], ENT_QUOTES, 'UTF-8') . '</div>';
echo '</div>';

echo '</div>';

echo '<div class="card">';
echo '<h2>Réponse</h2>';
if ($error) {
    echo '<div class="notice error">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</div>';
}

if ($respRow) {
    echo '<div class="notice">';
    echo '<div class="muted">Dernière réponse</div>';
    echo '<div style="white-space:pre-wrap;margin-top:6px">' . htmlspecialchars((string)$respRow['message'], ENT_QUOTES, 'UTF-8') . '</div>';
    if (!empty($respRow['attachment_url'])) {
        echo '<div style="margin-top:10px"><a class="btn" href="' . htmlspecialchars((string)$respRow['attachment_url'], ENT_QUOTES, 'UTF-8') . '" target="_blank" rel="noreferrer">Voir la pièce jointe</a></div>';
    }
    echo '<div class="muted" style="margin-top:8px">Envoyée le ' . htmlspecialchars((string)$respRow['created_at'], ENT_QUOTES, 'UTF-8') . '</div>';
    echo '</div>';
}

echo '<form method="post" enctype="multipart/form-data">';
echo csrf_field();

echo '<div class="field"><label>Message</label><textarea name="message" required>' . htmlspecialchars((string)($_POST['message'] ?? ''), ENT_QUOTES, 'UTF-8') . '</textarea></div>';
echo '<div class="field"><label>Pièce jointe (PDF ou image, facultatif)</label><input type="file" name="attachment" accept="application/pdf,image/*"></div>';

echo '<div class="actions">';
echo '<button class="btn primary" type="submit">Envoyer réponse & Notifier</button>';
echo '<a class="btn" href="/admin/requests_list.php">Retour</a>';
echo '</div>';

echo '</form>';

echo '</div>';

echo '</div>';

admin_page_end();
