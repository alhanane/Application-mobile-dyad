<?php
/**
 * Configuration - Institution AL HANANE
 * Version 2.0
 */

declare(strict_types=1);

// --- Base de données ---
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'alhanane_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// --- URL de base ---
$baseUrl = getenv('BASE_URL') ?: '';
define('BASE_URL', rtrim($baseUrl, '/'));

// --- Uploads ---
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('UPLOAD_URL_PREFIX', '/uploads');
define('MAX_FILE_SIZE_BYTES', (int)(getenv('MAX_FILE_SIZE_BYTES') ?: (10 * 1024 * 1024)));

// --- FCM ---
define('FCM_SERVER_KEY', getenv('FCM_SERVER_KEY') ?: '');
define('FCM_ENDPOINT', 'https://fcm.googleapis.com/fcm/send');
define('USE_GLOBAL_ALL_TOPIC', true);
define('GLOBAL_ALL_TOPIC', 'all');

// --- Session ---
define('SESSION_NAME', 'alhanane_parent_session');
define('SESSION_LIFETIME', 86400); // 24 heures
