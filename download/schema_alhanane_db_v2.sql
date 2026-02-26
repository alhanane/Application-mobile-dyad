-- ============================================
-- Institution AL HANANE - Build 02
-- Schéma de base de données MySQL 8.0
-- Version améliorée pour intégration Frontend/Backend
-- ============================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS alhanane_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
USE alhanane_db;

-- ============================================
-- TABLES DE RÉFÉRENCE
-- ============================================

-- Années scolaires
CREATE TABLE school_years (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  label VARCHAR(20) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Niveaux scolaires
CREATE TABLE levels (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  INDEX idx_sort (sort_order)
) ENGINE=InnoDB;

-- Classes
CREATE TABLE classes (
  id SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  level_id TINYINT UNSIGNED NOT NULL,
  code VARCHAR(16) NOT NULL,
  name VARCHAR(64) NOT NULL,
  capacity TINYINT UNSIGNED NULL,
  UNIQUE KEY uniq_level_code (level_id, code),
  INDEX idx_level (level_id),
  CONSTRAINT fk_classes_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Types de demandes (configurables)
CREATE TABLE request_types (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Catégories de notes d'information
CREATE TABLE info_note_categories (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(50) NOT NULL,
  color VARCHAR(7) NULL DEFAULT '#4F46E5',
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Catégories d'actualités
CREATE TABLE news_categories (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  label VARCHAR(50) NOT NULL,
  color VARCHAR(7) NULL DEFAULT '#F59E0B',
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ============================================
-- UTILISATEURS
-- ============================================

-- Parents d'élèves
CREATE TABLE parents (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  login VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  cin VARCHAR(32) NULL,
  gsm VARCHAR(32) NULL,
  home_phone VARCHAR(32) NULL,
  address TEXT NULL,
  email VARCHAR(120) NULL,
  avatar_url VARCHAR(255) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  first_login_at DATETIME NULL,
  last_login_at DATETIME NULL,
  password_changed_at DATETIME NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_login (login),
  INDEX idx_active (is_active),
  INDEX idx_gsm (gsm)
) ENGINE=InnoDB;

-- Élèves
CREATE TABLE students (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  birth_date DATE NULL,
  birth_place VARCHAR(100) NULL,
  gender ENUM('M','F') NULL,
  avatar_url VARCHAR(255) NULL,
  level_id TINYINT UNSIGNED NOT NULL,
  class_id SMALLINT UNSIGNED NOT NULL,
  school_year_id TINYINT UNSIGNED NULL,
  enrollment_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_level (level_id),
  INDEX idx_class (class_id),
  INDEX idx_active (is_active),
  INDEX idx_name (last_name, first_name),
  CONSTRAINT fk_students_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT,
  CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_students_year FOREIGN KEY (school_year_id) REFERENCES school_years(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Relation Parent-Enfant (gestion des accès)
CREATE TABLE parent_student (
  parent_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  relationship ENUM('pere','mere','tuteur','autre') NOT NULL DEFAULT 'pere',
  access_scope ENUM('full','restricted') NOT NULL DEFAULT 'full',
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (parent_id, student_id),
  INDEX idx_parent (parent_id),
  INDEX idx_student (student_id),
  INDEX idx_primary (student_id, is_primary),
  CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CONTENUS
-- ============================================

-- Notes d'information
CREATE TABLE info_notes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  pdf_url VARCHAR(500) NULL,
  pdf_filename VARCHAR(255) NULL,
  link_url VARCHAR(500) NULL,
  category_id TINYINT UNSIGNED NULL,
  target_type ENUM('all','level','class') NOT NULL DEFAULT 'all',
  level_id TINYINT UNSIGNED NULL,
  class_id SMALLINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_target (target_type, level_id, class_id),
  INDEX idx_published (published_at DESC),
  INDEX idx_pinned (is_pinned, published_at DESC),
  INDEX idx_category (category_id),
  INDEX idx_expires (expires_at),
  CONSTRAINT fk_in_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_in_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_in_category FOREIGN KEY (category_id) REFERENCES info_note_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Actualités
CREATE TABLE news (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  pdf_url VARCHAR(500) NULL,
  pdf_filename VARCHAR(255) NULL,
  link_url VARCHAR(500) NULL,
  category_id TINYINT UNSIGNED NULL,
  target_type ENUM('all','level','class') NOT NULL DEFAULT 'all',
  level_id TINYINT UNSIGNED NULL,
  class_id SMALLINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  is_pinned TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_target (target_type, level_id, class_id),
  INDEX idx_published (published_at DESC),
  INDEX idx_pinned (is_pinned, published_at DESC),
  INDEX idx_category (category_id),
  CONSTRAINT fk_news_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_news_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_news_category FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Suivi de lecture des notes d'information
CREATE TABLE info_note_reads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  info_note_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_read (info_note_id, parent_id),
  INDEX idx_parent (parent_id),
  INDEX idx_read_at (read_at),
  CONSTRAINT fk_inr_note FOREIGN KEY (info_note_id) REFERENCES info_notes(id) ON DELETE CASCADE,
  CONSTRAINT fk_inr_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Suivi de lecture des actualités
CREATE TABLE news_reads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  news_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_read (news_id, parent_id),
  INDEX idx_parent (parent_id),
  INDEX idx_read_at (read_at),
  CONSTRAINT fk_nr_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
  CONSTRAINT fk_nr_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- DEMANDES DES PARENTS
-- ============================================

-- Demandes
CREATE TABLE requests (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  request_type_id TINYINT UNSIGNED NOT NULL,
  type_legacy ENUM('attestation','facture','certificat','autre') NULL,
  subject VARCHAR(200) NULL,
  message TEXT NOT NULL,
  status ENUM('pending','in_progress','completed','rejected') NOT NULL DEFAULT 'pending',
  priority ENUM('low','normal','high') NOT NULL DEFAULT 'normal',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  INDEX idx_parent_status (parent_id, status),
  INDEX idx_status_created (status, created_at DESC),
  INDEX idx_student (student_id),
  INDEX idx_type (request_type_id),
  CONSTRAINT fk_req_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT,
  CONSTRAINT fk_req_type FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Réponses aux demandes
CREATE TABLE request_responses (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  attachment_url VARCHAR(500) NULL,
  attachment_filename VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_request (request_id),
  INDEX idx_created (created_at),
  CONSTRAINT fk_rr_req FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_rr_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- NOTIFICATIONS FCM
-- ============================================

-- Tokens des appareils
CREATE TABLE device_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL,
  platform ENUM('android','ios','web') NOT NULL,
  device_name VARCHAR(100) NULL,
  device_model VARCHAR(100) NULL,
  os_version VARCHAR(50) NULL,
  app_version VARCHAR(20) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_seen_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token (token),
  INDEX idx_parent_active (parent_id, is_active),
  INDEX idx_active (is_active),
  CONSTRAINT fk_dt_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Souscriptions aux topics FCM
CREATE TABLE fcm_topic_subscriptions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  device_token_id BIGINT UNSIGNED NOT NULL,
  topic VARCHAR(64) NOT NULL,
  subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_token_topic (device_token_id, topic),
  INDEX idx_topic (topic),
  CONSTRAINT fk_fts_token FOREIGN KEY (device_token_id) REFERENCES device_tokens(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Journal des notifications envoyées
CREATE TABLE notifications_log (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  kind ENUM('info_note','news','request_response','general') NOT NULL,
  reference_id BIGINT UNSIGNED NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  data JSON NULL,
  target ENUM('topic','tokens','parent') NOT NULL,
  topic VARCHAR(64) NULL,
  parent_id BIGINT UNSIGNED NULL,
  tokens_count INT UNSIGNED NULL,
  success_count INT UNSIGNED NULL,
  failure_count INT UNSIGNED NULL,
  status_code INT NULL,
  response_text TEXT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kind_ref (kind, reference_id),
  INDEX idx_sent (sent_at DESC),
  INDEX idx_parent (parent_id),
  CONSTRAINT fk_nl_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================
-- ADMINISTRATION
-- ============================================

-- Comptes administrateurs
CREATE TABLE admins (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NULL,
  last_name VARCHAR(80) NULL,
  email VARCHAR(120) NULL,
  role ENUM('super_admin','admin','staff') NOT NULL DEFAULT 'staff',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- Actions des administrateurs (audit)
CREATE TABLE admin_actions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin (admin_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created (created_at),
  CONSTRAINT fk_aa_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- CONFIGURATION
-- ============================================

-- Informations de contact de l'école
CREATE TABLE contact_info (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  school_name VARCHAR(200) NOT NULL DEFAULT 'Institution AL HANANE',
  phone VARCHAR(32) NOT NULL,
  phone_2 VARCHAR(32) NULL,
  fax VARCHAR(32) NULL,
  email VARCHAR(120) NOT NULL,
  website VARCHAR(200) NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NULL,
  country VARCHAR(100) NULL DEFAULT 'Maroc',
  latitude DECIMAL(10,8) NULL,
  longitude DECIMAL(11,8) NULL,
  working_hours TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Paramètres de l'application
CREATE TABLE app_settings (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(64) NOT NULL UNIQUE,
  setting_value TEXT NULL,
  setting_type ENUM('string','integer','boolean','json') NOT NULL DEFAULT 'string',
  description VARCHAR(255) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Année scolaire courante
INSERT INTO school_years (label, start_date, end_date, is_current) VALUES
('2024-2025', '2024-09-01', '2025-06-30', 1);

-- Niveaux scolaires
INSERT INTO levels (code, name, sort_order) VALUES
('CP', 'Cours Préparatoire', 1),
('CE1', 'Cours Élémentaire 1', 2),
('CE2', 'Cours Élémentaire 2', 3),
('CM1', 'Cours Moyen 1', 4),
('CM2', 'Cours Moyen 2', 5),
('6eme', '6ème Année', 6);

-- Classes par niveau
INSERT INTO classes (level_id, code, name) VALUES
-- CP
(1, 'A', 'CP A'),
(1, 'B', 'CP B'),
(1, 'C', 'CP C'),
-- CE1
(2, 'A', 'CE1 A'),
(2, 'B', 'CE1 B'),
-- CE2
(3, 'A', 'CE2 A'),
(3, 'B', 'CE2 B'),
-- CM1
(4, 'A', 'CM1 A'),
(4, 'B', 'CM1 B'),
-- CM2
(5, 'A', 'CM2 A'),
(5, 'B', 'CM2 B'),
-- 6ème
(6, 'A', '6ème A');

-- Types de demandes
INSERT INTO request_types (code, label, sort_order) VALUES
('attestation', 'Attestation de scolarité', 1),
('facture', 'Facture frais de scolarité', 2),
('certificat', 'Certificat de départ', 3),
('releve', 'Relevé de notes', 4),
('transfert', 'Dossier de transfert', 5),
('autre', 'Autre demande', 99);

-- Catégories de notes d'information
INSERT INTO info_note_categories (code, label, color, sort_order) VALUES
('administratif', 'Administratif', '#4F46E5', 1),
('securite', 'Sécurité', '#DC2626', 2),
('calendrier', 'Calendrier', '#059669', 3),
('cantine', 'Cantine', '#F59E0B', 4),
('transport', 'Transport', '#0EA5E9', 5),
('general', 'Général', '#6B7280', 99);

-- Catégories d'actualités
INSERT INTO news_categories (code, label, color, sort_order) VALUES
('evenement', 'Événement', '#4F46E5', 1),
('information', 'Information', '#0EA5E9', 2),
('pedagogie', 'Pédagogie', '#059669', 3),
('sport', 'Sport', '#F59E0B', 4),
('culture', 'Culture', '#8B5CF6', 5),
('resultats', 'Résultats', '#DC2626', 6);

-- Informations de contact par défaut
INSERT INTO contact_info (school_name, phone, email, address) VALUES
('Institution AL HANANE', '05 22 XX XX XX', 'contact@alhanane.ma', '123 Avenue Mohammed V, Casablanca, Maroc');

-- Paramètres par défaut
INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES
('pwa_install_prompt', 'true', 'boolean', 'Afficher le prompt d''installation PWA'),
('max_login_attempts', '5', 'integer', 'Nombre maximum de tentatives de connexion'),
('session_timeout', '3600', 'integer', 'Durée de session en secondes'),
('fcm_enabled', 'true', 'boolean', 'Activer les notifications FCM'),
('maintenance_mode', 'false', 'boolean', 'Mode maintenance'),
('app_version', '2.0.0', 'string', 'Version de l''application');

-- Administrateur par défaut (mot de passe: admin123)
INSERT INTO admins (username, password_hash, first_name, last_name, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'System', 'super_admin');

-- Parent de test (mot de passe: 123456)
INSERT INTO parents (login, password_hash, first_name, last_name, gsm, email, address) VALUES
('parent.pere', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jean', 'Martin', '06 12 34 56 78', 'jean.martin@email.com', '123 Rue des Lilas, Casablanca');

-- Élèves de test
INSERT INTO students (first_name, last_name, level_id, class_id) VALUES
('Lucas', 'Martin', 3, 6),
('Emma', 'Martin', 5, 10);

-- Association parent-élèves
INSERT INTO parent_student (parent_id, student_id, relationship, is_primary) VALUES
(1, 1, 'pere', 1),
(1, 2, 'pere', 1);

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour les statistiques du dashboard admin
CREATE VIEW v_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM parents WHERE is_active = 1) AS total_parents,
  (SELECT COUNT(*) FROM students WHERE is_active = 1) AS total_students,
  (SELECT COUNT(*) FROM info_notes) AS total_info_notes,
  (SELECT COUNT(*) FROM news) AS total_news,
  (SELECT COUNT(*) FROM requests WHERE status = 'pending') AS pending_requests,
  (SELECT COUNT(*) FROM device_tokens WHERE is_active = 1) AS active_devices;

-- Vue pour les élèves avec leur classe et niveau
CREATE VIEW v_students_full AS
SELECT 
  s.id,
  s.first_name,
  s.last_name,
  s.avatar_url,
  l.code AS level_code,
  l.name AS level_name,
  c.code AS class_code,
  c.name AS class_name,
  CONCAT(l.code, '/', c.code) AS full_class
FROM students s
JOIN levels l ON l.id = s.level_id
JOIN classes c ON c.id = s.class_id
WHERE s.is_active = 1;

-- Vue pour les demandes avec détails
CREATE VIEW v_requests_full AS
SELECT 
  r.id,
  r.status,
  r.message,
  r.created_at,
  rt.label AS type_label,
  p.first_name AS parent_first_name,
  p.last_name AS parent_last_name,
  p.login AS parent_login,
  s.first_name AS student_first_name,
  s.last_name AS student_last_name,
  v.full_class AS student_class
FROM requests r
JOIN request_types rt ON rt.id = r.request_type_id
JOIN parents p ON p.id = r.parent_id
JOIN students s ON s.id = r.student_id
JOIN v_students_full v ON v.id = s.id;

-- ============================================
-- PROCÉDURES STOCKÉES
-- ============================================

DELIMITER //

-- Procédure pour obtenir les notes visibles par un parent
CREATE PROCEDURE sp_get_visible_info_notes(IN p_parent_id BIGINT)
BEGIN
  SELECT DISTINCT 
    i.*,
    ic.label AS category_label,
    ic.color AS category_color,
    CASE WHEN ir.id IS NOT NULL THEN 1 ELSE 0 END AS is_read
  FROM info_notes i
  LEFT JOIN info_note_categories ic ON ic.id = i.category_id
  LEFT JOIN info_note_reads ir ON ir.info_note_id = i.id AND ir.parent_id = p_parent_id
  WHERE i.published_at <= NOW()
    AND (i.expires_at IS NULL OR i.expires_at > NOW())
    AND (
      i.target_type = 'all'
      OR (i.target_type = 'level' AND i.level_id IN (
        SELECT DISTINCT s.level_id 
        FROM parent_student ps 
        JOIN students s ON s.id = ps.student_id 
        WHERE ps.parent_id = p_parent_id
      ))
      OR (i.target_type = 'class' AND i.class_id IN (
        SELECT DISTINCT s.class_id 
        FROM parent_student ps 
        JOIN students s ON s.id = ps.student_id 
        WHERE ps.parent_id = p_parent_id
      ))
    )
  ORDER BY i.is_pinned DESC, i.published_at DESC;
END //

-- Procédure pour obtenir les actualités visibles par un parent
CREATE PROCEDURE sp_get_visible_news(IN p_parent_id BIGINT)
BEGIN
  SELECT DISTINCT 
    n.*,
    nc.label AS category_label,
    nc.color AS category_color,
    CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END AS is_read
  FROM news n
  LEFT JOIN news_categories nc ON nc.id = n.category_id
  LEFT JOIN news_reads nr ON nr.news_id = n.id AND nr.parent_id = p_parent_id
  WHERE n.published_at <= NOW()
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
    AND (
      n.target_type = 'all'
      OR (n.target_type = 'level' AND n.level_id IN (
        SELECT DISTINCT s.level_id 
        FROM parent_student ps 
        JOIN students s ON s.id = ps.student_id 
        WHERE ps.parent_id = p_parent_id
      ))
      OR (n.target_type = 'class' AND n.class_id IN (
        SELECT DISTINCT s.class_id 
        FROM parent_student ps 
        JOIN students s ON s.id = ps.student_id 
        WHERE ps.parent_id = p_parent_id
      ))
    )
  ORDER BY n.is_pinned DESC, n.published_at DESC;
END //

-- Procédure pour marquer une note comme lue
CREATE PROCEDURE sp_mark_info_note_read(IN p_info_note_id BIGINT, IN p_parent_id BIGINT)
BEGIN
  INSERT IGNORE INTO info_note_reads (info_note_id, parent_id)
  VALUES (p_info_note_id, p_parent_id);
END //

-- Procédure pour marquer une actualité comme lue
CREATE PROCEDURE sp_mark_news_read(IN p_news_id BIGINT, IN p_parent_id BIGINT)
BEGIN
  INSERT IGNORE INTO news_reads (news_id, parent_id)
  VALUES (p_news_id, p_parent_id);
END //

DELIMITER ;
