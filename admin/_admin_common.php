<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../config/csrf.php';
require_once __DIR__ . '/../lib/utils.php';
require_once __DIR__ . '/../lib/fcm.php';
require_once __DIR__ . '/../lib/notifications.php';

function ensure_initial_admin(PDO $pdo): void
{
    $st = $pdo->query('SELECT COUNT(*) FROM admins');
    $count = (int)$st->fetchColumn();
    if ($count > 0) return;

    $user = getenv('INIT_ADMIN_USER') ?: 'admin';
    $pass = getenv('INIT_ADMIN_PASS') ?: 'admin123';

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO admins (username, password_hash, role) VALUES (:u, :p, \'admin\')');
    $ins->execute([':u' => $user, ':p' => $hash]);
}

function admin_page_start(string $title): void
{
    $pdo = db();
    ensure_initial_admin($pdo);

    $t = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');

    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>' . $t . '</title>';
    echo '<style>
    :root{
      --bg:#F6F5FF;
      --card:#FFFFFF;
      --text:#1E1B4B;
      --muted:#5B5A7A;
      --primary:#5B56F6;
      --primary-2:#7C3AED;
      --border:rgba(30,27,75,.10);
      --shadow:0 14px 35px rgba(30,27,75,.12);
      --radius:18px;
      --ring:0 0 0 4px rgba(91,86,246,.18);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial;
    }
    body{margin:0;background:var(--bg);color:var(--text);}
    a{color:inherit;text-decoration:none;}
    .wrap{max-width:1100px;margin:0 auto;padding:18px;}
    .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);}
    .brand{display:flex;align-items:center;gap:10px;}
    .logo{width:36px;height:36px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--primary-2));}
    .brand h1{font-size:14px;line-height:1.1;margin:0;letter-spacing:.3px;}
    .brand p{margin:2px 0 0;color:var(--muted);font-size:12px;}
    .nav{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-end;}
    .pill{padding:9px 12px;border-radius:999px;border:1px solid var(--border);background:rgba(255,255,255,.65);font-size:13px;}
    .pill:hover{box-shadow:var(--ring);}
    .pill.primary{border-color:rgba(91,86,246,.25);background:rgba(91,86,246,.10);}
    .grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:14px;}
    @media(min-width:900px){.grid.two{grid-template-columns:1fr 1fr;}}
    .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:16px;}
    .card h2{margin:0 0 10px;font-size:16px;letter-spacing:.2px;}
    .muted{color:var(--muted);}
    .field{display:flex;flex-direction:column;gap:6px;margin:10px 0;}
    label{font-size:13px;color:var(--muted);}
    input, textarea, select{border-radius:14px;border:1px solid var(--border);padding:10px 12px;font-size:14px;outline:none;background:#fff;}
    input:focus, textarea:focus, select:focus{box-shadow:var(--ring);border-color:rgba(91,86,246,.35);}
    textarea{min-height:120px;resize:vertical;}
    .row{display:grid;grid-template-columns:1fr;gap:12px;}
    @media(min-width:900px){.row.two{grid-template-columns:1fr 1fr;}}
    .actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}
    .btn{border:none;border-radius:999px;padding:11px 14px;font-size:14px;cursor:pointer;background:rgba(30,27,75,.06);color:var(--text);}
    .btn:hover{box-shadow:var(--ring);}
    .btn.primary{background:linear-gradient(135deg,var(--primary),var(--primary-2));color:white;}
    .btn.danger{background:#F43F5E;color:white;}
    .notice{border-radius:16px;padding:12px 14px;margin:10px 0;border:1px solid var(--border);background:rgba(91,86,246,.08);}
    .error{background:rgba(244,63,94,.10);border-color:rgba(244,63,94,.25);}
    table{width:100%;border-collapse:separate;border-spacing:0 10px;}
    th{font-size:12px;color:var(--muted);text-align:left;padding:0 10px;}
    td{background:rgba(255,255,255,.8);border:1px solid var(--border);padding:10px;border-left:none;border-right:none;}
    tr td:first-child{border-left:1px solid var(--border);border-top-left-radius:14px;border-bottom-left-radius:14px;}
    tr td:last-child{border-right:1px solid var(--border);border-top-right-radius:14px;border-bottom-right-radius:14px;}
    .tag{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(30,27,75,.06);font-size:12px;}
    .tag.ok{background:rgba(34,197,94,.12);}
    .tag.warn{background:rgba(245,158,11,.14);}
    </style>';
    echo '</head><body><div class="wrap">';

    echo '<div class="topbar">';
    echo '<div class="brand"><div class="logo" aria-hidden="true"></div><div><h1>Mini Back‑Office</h1><p>Build 01 — Notes, Actus, Demandes</p></div></div>';
    echo '<div class="nav">';
    echo '<a class="pill" href="/admin/index.php">Dashboard</a>';
    echo '<a class="pill primary" href="/admin/info_create.php">Créer Note</a>';
    echo '<a class="pill primary" href="/admin/news_create.php">Créer Actu</a>';
    echo '<a class="pill" href="/admin/requests_list.php">Demandes</a>';
    echo '<a class="pill" href="/admin/logout.php">Déconnexion</a>';
    echo '</div></div>';
}

function admin_page_end(): void
{
    echo '</div></body></html>';
}

function admin_flash_set(string $kind, string $msg): void
{
    start_session_secure();
    $_SESSION['_flash'] = ['kind' => $kind, 'msg' => $msg];
}

function admin_flash_get(): ?array
{
    start_session_secure();
    if (empty($_SESSION['_flash'])) return null;
    $f = $_SESSION['_flash'];
    unset($_SESSION['_flash']);
    return is_array($f) ? $f : null;
}
