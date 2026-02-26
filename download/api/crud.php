<?php
/**
 * API CRUD Générique - Institution AL HANANE
 * Version 2.0 - Adaptation Backend/Frontend complète
 * 
 * Tables autorisées pour l'application PWA Parents
 */

file_put_contents("debug_body.txt", file_get_contents("php://input") . PHP_EOL, FILE_APPEND);

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

try {

    $pdo = new PDO(
        "mysql:host=localhost;dbname=alhanane_db;charset=utf8mb4",
        "root",
        "",
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    $input = json_decode(file_get_contents("php://input"), true);
    if (!$input) throw new Exception("JSON invalide");

    $action = $input['action'] ?? '';
    $table  = $input['table'] ?? '';

    // ==========================================
    // TABLES AUTORISÉES - Application AL HANANE
    // ==========================================
    $allowedTables = [
        // Tables de référence
        'school_years',
        'levels',
        'classes',
        'request_types',
        'info_note_categories',
        'news_categories',
        
        // Tables utilisateurs
        'parents',
        'students',
        'parent_student',
        
        // Tables contenus
        'info_notes',
        'news',
        'info_note_reads',
        'news_reads',
        
        // Tables demandes
        'requests',
        'request_responses',
        
        // Tables notifications FCM
        'device_tokens',
        'fcm_topic_subscriptions',
        'notifications_log',
        
        // Tables administration
        'admins',
        'admin_actions',
        
        // Tables configuration
        'contact_info',
        'app_settings'
    ];

    if (!in_array($table, $allowedTables))
        throw new Exception("Table non autorisée: $table");

    // ==============================
    // SCHÉMA TABLE
    // ==============================
    $schema = $pdo->query("DESCRIBE `$table`")->fetchAll();

    $columns = [];
    $dateColumns = [];
    $primaryKey = 'id';

    foreach ($schema as $col) {

        $columns[] = $col['Field'];
        
        if ($col['Key'] === 'PRI') {
            $primaryKey = $col['Field'];
        }

        $type  = strtolower($col['Type']);
        $field = strtolower($col['Field']);

        $isDateType =
            str_contains($type, 'timestamp') ||
            str_contains($type, 'datetime') ||
            preg_match('/^date/', $type);

        $isLikelyTsInt =
            (str_contains($type, 'int') || str_contains($type, 'bigint')) &&
            preg_match('/(date|_at|timestamp|ts)/', $field);

        if ($isDateType || $isLikelyTsInt) {
            $dateColumns[] = $col['Field'];
        }
    }

    // ==============================
    // PARSE DATE
    // ==============================
    function parse_date_to_timestamp($v) {

        if ($v === null || $v === '') return null;

        if (is_numeric($v) && $v > 1000000000000)
            return intval($v / 1000);

        if (is_numeric($v))
            return intval($v);

        $s = trim((string)$v);

        // Format FR dd/mm/yyyy
        if (preg_match('/^\d{2}[\/-]\d{2}[\/-]\d{4}(\s+\d{2}:\d{2}(:\d{2})?)?$/', $s)) {

            $s = str_replace('-', '/', $s);

            $fmt = (preg_match('/\d{2}:\d{2}:\d{2}$/', $s)) ? 'd/m/Y H:i:s'
                 : (preg_match('/\d{2}:\d{2}$/', $s) ? 'd/m/Y H:i' : 'd/m/Y');

            $dt = DateTime::createFromFormat($fmt, $s);
            if ($dt instanceof DateTime)
                return $dt->getTimestamp();

            return null;
        }

        // Format ISO yyyy-mm-dd
        if (preg_match('/^\d{4}-\d{2}-\d{2}(\s+\d{2}:\d{2}(:\d{2})?)?$/', $s)) {

            $fmt = (preg_match('/\d{2}:\d{2}:\d{2}$/', $s)) ? 'Y-m-d H:i:s'
                 : (preg_match('/\d{2}:\d{2}$/', $s) ? 'Y-m-d H:i' : 'Y-m-d');

            $dt = DateTime::createFromFormat($fmt, $s);
            if ($dt instanceof DateTime)
                return $dt->getTimestamp();

            return null;
        }

        $t = strtotime($s);
        return ($t !== false) ? $t : null;
    }

    switch ($action) {

        // ==============================
        // LIST
        // ==============================
        case 'list':

            $select = $input['select'] ?? ['*'];
            $where  = $input['where'] ?? [];
            $order  = $input['order_by'] ?? [];
            $limit  = intval($input['limit'] ?? 50);
            $offset = intval($input['offset'] ?? 0);
            $joins  = $input['joins'] ?? [];

            if ($limit > 500)
                throw new Exception("Limit trop élevé");

            if ($select !== ['*']) {
                foreach ($select as $col) {
                    if (!in_array($col, $columns) && !preg_match('/\./', $col))
                        throw new Exception("Colonne invalide : $col");
                }
                $select_sql = implode(",", $select);
            } else {
                $select_sql = "*";
            }

            $sqlBase = " FROM `$table`";
            $params = [];

            // Gestion des JOINs
            $allowedJoins = [
                'levels' => ['table' => 'levels', 'alias' => 'l', 'on' => 'level_id', 'select' => ['l.code as level_code', 'l.name as level_name']],
                'classes' => ['table' => 'classes', 'alias' => 'c', 'on' => 'class_id', 'select' => ['c.code as class_code', 'c.name as class_name']],
                'parents' => ['table' => 'parents', 'alias' => 'p', 'on' => 'parent_id', 'select' => ['p.first_name as parent_first_name', 'p.last_name as parent_last_name']],
                'students' => ['table' => 'students', 'alias' => 's', 'on' => 'student_id', 'select' => ['s.first_name as student_first_name', 's.last_name as student_last_name']],
            ];

            if (!empty($joins)) {
                foreach ($joins as $join) {
                    if (isset($allowedJoins[$join])) {
                        $j = $allowedJoins[$join];
                        $sqlBase .= " LEFT JOIN `{$j['table']}` {$j['alias']} ON {$j['alias']}.id = `$table`.{$j['on']}";
                        if ($select === ['*']) {
                            $select_sql .= ', ' . implode(', ', $j['select']);
                        }
                    }
                }
            }

            $sqlBase .= " WHERE 1=1 ";

            $allowedOperators = ['=','>','<','>=','<=','LIKE','!=','IN','NOT IN','IS NULL','IS NOT NULL'];

            foreach ($where as $i => $cond) {

                if (!in_array($cond['column'], $columns))
                    throw new Exception("Colonne WHERE invalide");

                if (!in_array($cond['operator'], $allowedOperators))
                    throw new Exception("Opérateur interdit");

                if (in_array($cond['operator'], ['IS NULL', 'IS NOT NULL'])) {
                    $sqlBase .= " AND {$cond['column']} {$cond['operator']}";
                } elseif (in_array($cond['operator'], ['IN', 'NOT IN'])) {
                    $values = (array)$cond['value'];
                    $placeholders = [];
                    foreach ($values as $vi => $v) {
                        $ph = ":w{$i}_{$vi}";
                        $placeholders[] = $ph;
                        $params[$ph] = $v;
                    }
                    $sqlBase .= " AND {$cond['column']} {$cond['operator']} (" . implode(',', $placeholders) . ")";
                } else {
                    $param = ":w$i";
                    $sqlBase .= " AND {$cond['column']} {$cond['operator']} $param";
                    $params[$param] = $cond['value'];
                }
            }

            $stmtCount = $pdo->prepare("SELECT COUNT(*) as total $sqlBase");
            foreach ($params as $k => $v)
                $stmtCount->bindValue($k, $v);
            $stmtCount->execute();
            $total = $stmtCount->fetch()['total'];

            if ($order) {

                $order_sql = [];

                foreach ($order as $ord) {

                    if (!in_array($ord['column'], $columns) && !preg_match('/\./', $ord['column']))
                        throw new Exception("Colonne ORDER invalide");

                    $direction = strtoupper($ord['direction']);
                    if (!in_array($direction, ['ASC','DESC']))
                        throw new Exception("Direction invalide");

                    $order_sql[] = "{$ord['column']} $direction";
                }

                $sqlBase .= " ORDER BY " . implode(",", $order_sql);
            }

            $sql = "SELECT $select_sql $sqlBase LIMIT :limit OFFSET :offset";
            $stmt = $pdo->prepare($sql);

            foreach ($params as $k => $v)
                $stmt->bindValue($k, $v);

            $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
            $stmt->bindValue(":offset", $offset, PDO::PARAM_INT);

            $stmt->execute();
            $data = $stmt->fetchAll();

            foreach ($data as &$row) {
                foreach ($dateColumns as $col) {
                    if (isset($row[$col]) && $row[$col] !== null) {
                        if (is_numeric($row[$col]))
                            $row[$col] *= 1000;
                        else
                            $row[$col] = strtotime($row[$col]) * 1000;
                    }
                }
            }

            echo json_encode([
                "success" => true,
                "data"    => $data,
                "total"   => $total
            ]);

            break;


        // ==============================
        // INSERT
        // ==============================
        case 'insert':

            $pdo->beginTransaction();

            try {

                $data = $input['data'] ?? [];
                if (!$data) throw new Exception("Données manquantes");

                $data = array_intersect_key($data, array_flip($columns));
                if (!$data) throw new Exception("Aucune colonne valide");

                foreach ($data as $k => $v) {
                    if (in_array($k, $dateColumns))
                        $data[$k] = parse_date_to_timestamp($v);
                }

                $cols = implode(",", array_keys($data));
                $placeholders = ":" . implode(",:", array_keys($data));

                $sql = "INSERT INTO `$table` ($cols) VALUES ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($data);

                if ($stmt->rowCount() === 0)
                    throw new Exception("Insert non exécuté");

                $pdo->commit();

                echo json_encode([
                    "success"   => true,
                    "insert_id" => $pdo->lastInsertId()
                ]);

            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }

            break;


        // ==============================
        // UPDATE
        // ==============================
        case 'update':

            $pdo->beginTransaction();

            try {

                $id   = $input['id'] ?? null;
                $data = $input['data'] ?? [];

                if (!$id || !$data)
                    throw new Exception("Paramètres manquants");

                $data = array_intersect_key($data, array_flip($columns));
                if (!$data)
                    throw new Exception("Aucune colonne valide");

                foreach ($data as $k => $v) {
                    if (in_array($k, $dateColumns))
                        $data[$k] = parse_date_to_timestamp($v);
                }

                $set = [];
                foreach ($data as $col => $v)
                    $set[] = "$col = :$col";

                $sql = "UPDATE `$table` SET ".implode(",", $set)." WHERE $primaryKey = :id";
                $data['id'] = $id;

                $stmt = $pdo->prepare($sql);
                $stmt->execute($data);

                $pdo->commit();

                echo json_encode([
                    "success" => true,
                    "rows_affected" => $stmt->rowCount()
                ]);

            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }

            break;


        // ==============================
        // DELETE
        // ==============================
        case 'delete':

            $pdo->beginTransaction();

            try {

                $id = $input['id'] ?? null;
                if (!$id)
                    throw new Exception("ID manquant");

                $stmt = $pdo->prepare("DELETE FROM `$table` WHERE $primaryKey = :id");
                $stmt->execute([":id"=>$id]);

                if ($stmt->rowCount() === 0)
                    throw new Exception("Aucune ligne supprimée");

                $pdo->commit();

                echo json_encode(["success"=>true]);

            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }

            break;
            
        // ==============================
        // RAW QUERY (Admin only - for complex queries)
        // ==============================
        case 'raw':
            // Sécurité: vérifier que c'est un admin
            // Pour la démo, on autorise les requêtes SELECT uniquement
            $query = $input['query'] ?? '';
            $queryParams = $input['params'] ?? [];
            
            if (empty($query)) {
                throw new Exception("Requête vide");
            }
            
            // Sécurité: Autoriser uniquement SELECT
            if (!preg_match('/^\s*SELECT\s+/i', $query)) {
                throw new Exception("Seules les requêtes SELECT sont autorisées");
            }
            
            // Bloquer les commandes dangereuses
            if (preg_match('/(DROP|DELETE|TRUNCATE|ALTER|CREATE|UPDATE|INSERT|GRANT|REVOKE)/i', $query)) {
                throw new Exception("Commande non autorisée");
            }
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($queryParams);
            $data = $stmt->fetchAll();
            
            // Convertir les dates
            foreach ($data as &$row) {
                foreach ($dateColumns as $col) {
                    if (isset($row[$col]) && $row[$col] !== null) {
                        if (is_numeric($row[$col]))
                            $row[$col] *= 1000;
                        else
                            $row[$col] = strtotime($row[$col]) * 1000;
                    }
                }
            }
            
            echo json_encode([
                "success" => true,
                "data" => $data
            ]);
            break;


        default:
            throw new Exception("Action inconnue: $action");
    }

} catch (Exception $e) {

    echo json_encode([
        "success"=>false,
        "error"=>$e->getMessage()
    ]);
}
