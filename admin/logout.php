<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/auth.php';

logout_all();
header('Location: /admin/login.php');
exit;
