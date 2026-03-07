<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('GET');

json_response(true, [
    'phone' => CONTACT_PHONE,
    'email' => CONTACT_EMAIL,
    'address' => CONTACT_ADDRESS,
]);
