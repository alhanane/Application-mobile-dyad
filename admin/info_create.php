<?php
declare(strict_types=1);

require_once __DIR__ . '/_admin_common.php';

$adminId = require_admin();
$pdo = db();

$levels = $pdo->query('SELECT id, code, name FROM levels ORDER BY id ASC')->fetchAll();
$classes = $pdo->query('SELECT c.id, c.code, c.name, l.code AS level_code FROM classes c JOIN levels l ON l.id = c.level_id ORDER BY l.id ASC, c.code ASC')->fetchAll();

$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    try {
        csrf_verify_or_die();

        $title = trim((string)($_POST['title'] ?? ''));
        $description = trim((string)($_POST['description'] ?? ''));
        $imageUrl = trim((string)($_POST['image_url'] ?? ''));
        $linkUrl = trim((string)($_POST['link_url'] ?? ''));
        $targetType = strtolower(trim((string)($_POST['target_type'] ?? 'all')));
        $levelId = (int)($_POST['level_id'] ?? 0);
        $classId = (int)($_POST['class_id'] ?? 0);
        $publishedAt = to_mysql_datetime(trim((string)($_POST['published_at'] ?? '')));

        if ($title === '' || $description === '') {
            throw new RuntimeException('Titre et description requis.');
        }
        if (!is_valid_url($imageUrl) || !is_valid_url($linkUrl)) {
            throw new RuntimeException('URL invalide.');
        }

        if (!in_array($targetType, ['all','level','class'], true)) {
            $targetType = 'all';
        }
        if ($targetType === 'level' && $levelId <= 0) {
            throw new RuntimeException('Veuillez choisir un niveau.');
        }
        if ($targetType === 'class' && $classId <= 0) {
            throw new RuntimeException('Veuillez choisir une classe.');
        }

        // PDF upload OR link URL (optional)
        $pdfUrl = null;
        try {
            $pdfUrl = upload_file('pdf_file', 'info_pdfs', ['application/pdf'], ['pdf']);
        } catch (Throwable $e) {
            throw new RuntimeException('PDF: ' . $e->getMessage());
        }

        if ($pdfUrl && $linkUrl) {
            throw new RuntimeException('Choisissez soit un PDF soit un lien, pas les deux.');
        }

        $stmt = $pdo->prepare(
            'INSERT INTO info_notes (title, description, image_url, pdf_url, link_url, target_type, level_id, class_id, published_at, created_by)\n'
            . 'VALUES (:t,:d,:img,:pdf,:link,:tt,:lid,:cid,:pub,:cb)'
        );
        $stmt->execute([
            ':t' => $title,
            ':d' => $description,
            ':img' => $imageUrl ?: null,
            ':pdf' => $pdfUrl,
            ':link' => $linkUrl ?: null,
            ':tt' => $targetType,
            ':lid' => ($targetType === 'level') ? $levelId : null,
            ':cid' => ($targetType === 'class') ? $classId : null,
            ':pub' => $publishedAt ?: date('Y-m-d H:i:s'),
            ':cb' => $adminId,
        ]);
        $id = (int)$pdo->lastInsertId();

        $topics = determine_topics($pdo, $targetType, ($targetType === 'level') ? $levelId : null, ($targetType === 'class') ? $classId : null);

        $titleNotif = 'Nouvelle note';
        $bodyNotif = $title;
        $data = ['kind' => 'info', 'id' => $id, 'deeplink' => '/info/' . $id];

        $sentCount = 0;
        foreach ($topics as $topic) {
            $resp = sendToTopic($topic, $titleNotif, $bodyNotif, $data);
            log_notification($pdo, 'info_note', $titleNotif, $bodyNotif, 'topic', $topic, null, $resp['status'] ?? null, $resp['response'] ?? null);
            $sentCount++;
        }

        admin_flash_set('info', 'Note publiée. Notifications envoyées sur ' . $sentCount . ' topic(s).');
        header('Location: /admin/index.php');
        exit;
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}

admin_page_start('Créer une note');

echo '<div class="grid"><div class="card">';
echo '<h2>Créer une Note d\'information</h2>';
echo '<p class="muted">Publie en base et déclenche un push FCM sur les topics (niveau/classe). Le client filtre aussi selon les enfants.</p>';

if ($error) {
    echo '<div class="notice error">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</div>';
}

echo '<form method="post" enctype="multipart/form-data">';
echo csrf_field();

echo '<div class="field"><label>Titre</label><input name="title" required maxlength="200" value="' . htmlspecialchars((string)($_POST['title'] ?? ''), ENT_QUOTES, 'UTF-8') . '"></div>';
echo '<div class="field"><label>Description</label><textarea name="description" required>' . htmlspecialchars((string)($_POST['description'] ?? ''), ENT_QUOTES, 'UTF-8') . '</textarea></div>';

echo '<div class="row two">';
echo '<div class="field"><label>Image (URL, facultatif)</label><input name="image_url" placeholder="https://..." value="' . htmlspecialchars((string)($_POST['image_url'] ?? ''), ENT_QUOTES, 'UTF-8') . '"></div>';
echo '<div class="field"><label>Date de publication</label><input type="datetime-local" name="published_at" value="' . htmlspecialchars((string)($_POST['published_at'] ?? ''), ENT_QUOTES, 'UTF-8') . '"></div>';
echo '</div>';

echo '<div class="row two">';
echo '<div class="field"><label>Document PDF (upload)</label><input type="file" name="pdf_file" accept="application/pdf"></div>';
echo '<div class="field"><label>OU Lien URL</label><input name="link_url" placeholder="https://..." value="' . htmlspecialchars((string)($_POST['link_url'] ?? ''), ENT_QUOTES, 'UTF-8') . '"></div>';
echo '</div>';

echo '<div class="card" style="box-shadow:none;background:rgba(30,27,75,.03)">';
echo '<h2 style="font-size:14px;margin:0 0 10px">Ciblage</h2>';

echo '<div class="row two">';
echo '<div class="field"><label>Type</label><select name="target_type">';
$curT = strtolower((string)($_POST['target_type'] ?? 'all'));
foreach (["all" => "Tous", "level" => "Niveau", "class" => "Classe"] as $k => $lbl) {
    $sel = $curT === $k ? 'selected' : '';
    echo '<option value="' . $k . '" ' . $sel . '>' . $lbl . '</option>';
}

echo '</select></div>';

echo '<div class="field"><label>Niveau (si Type = Niveau)</label><select name="level_id"><option value="0">—</option>';
$curL = (int)($_POST['level_id'] ?? 0);
foreach ($levels as $l) {
    $sel = $curL === (int)$l['id'] ? 'selected' : '';
    echo '<option value="' . (int)$l['id'] . '" ' . $sel . '>' . htmlspecialchars($l['code'] . ' — ' . $l['name'], ENT_QUOTES, 'UTF-8') . '</option>';
}

echo '</select></div>';
echo '</div>';

echo '<div class="field"><label>Classe (si Type = Classe)</label><select name="class_id"><option value="0">—</option>';
$curC = (int)($_POST['class_id'] ?? 0);
foreach ($classes as $c) {
    $sel = $curC === (int)$c['id'] ? 'selected' : '';
    $label = $c['level_code'] . '/' . $c['code'] . ' — ' . $c['name'];
    echo '<option value="' . (int)$c['id'] . '" ' . $sel . '>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</option>';
}

echo '</select></div>';

echo '</div>';

echo '<div class="actions"><button class="btn primary" type="submit">Publier & Notifier</button><a class="btn" href="/admin/index.php">Annuler</a></div>';

echo '</form>';

echo '</div></div>';

admin_page_end();
