<?php
declare(strict_types=1);

require_once __DIR__ . '/../_common.php';

require_method('POST');
logout_all();
json_response(true, (object)[]);
