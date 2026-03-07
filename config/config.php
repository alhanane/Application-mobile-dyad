<?php
declare(strict_types=1);

// Central configuration (no Composer)

// --- Database ---
// Prefer environment variables in production.
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: 'school_app');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// --- Base URL ---
// Used to build public URLs for uploaded files.
// Example: https://your-domain.tld
$baseUrl = getenv('BASE_URL') ?: '';
define('BASE_URL', rtrim($baseUrl, '/'));

// --- Uploads ---
// Stored paths are relative to project root, served by Apache.
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('UPLOAD_URL_PREFIX', '/uploads');
define('MAX_FILE_SIZE_BYTES', (int)(getenv('MAX_FILE_SIZE_BYTES') ?: (10 * 1024 * 1024))); // 10MB

// If your client subscribes to a global topic for “Tous”, set this to true.
define('USE_GLOBAL_ALL_TOPIC', (getenv('USE_GLOBAL_ALL_TOPIC') ?: '1') === '1');
define('GLOBAL_ALL_TOPIC', getenv('GLOBAL_ALL_TOPIC') ?: 'all');

// --- FCM ---
define('FCM_SERVER_KEY', getenv('FCM_SERVER_KEY') ?: '');
define('FCM_ENDPOINT', 'https://fcm.googleapis.com/fcm/send');

// --- Contact (Build 01) ---
define('CONTACT_PHONE', getenv('CONTACT_PHONE') ?: '');
define('CONTACT_EMAIL', getenv('CONTACT_EMAIL') ?: '');
define('CONTACT_ADDRESS', getenv('CONTACT_ADDRESS') ?: '');
