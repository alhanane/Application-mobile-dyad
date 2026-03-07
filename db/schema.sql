-- Build 01 schema (MySQL 8)

-- Parents et Enfants
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
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE levels (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL UNIQUE,
  name VARCHAR(32) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE classes (
  id SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  level_id TINYINT UNSIGNED NOT NULL,
  code VARCHAR(16) NOT NULL,
  name VARCHAR(32) NOT NULL,
  UNIQUE KEY uniq_level_code (level_id, code),
  CONSTRAINT fk_classes_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE students (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  level_id TINYINT UNSIGNED NOT NULL,
  class_id SMALLINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE RESTRICT,
  CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE parent_student (
  parent_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  access_scope ENUM('full','restricted') NOT NULL DEFAULT 'full',
  PRIMARY KEY (parent_id, student_id),
  CONSTRAINT fk_ps_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Contenus
CREATE TABLE info_notes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  pdf_url VARCHAR(255) NULL,
  link_url VARCHAR(255) NULL,
  target_type ENUM('all','level','class') NOT NULL DEFAULT 'all',
  level_id TINYINT UNSIGNED NULL,
  class_id SMALLINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  CONSTRAINT fk_in_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_in_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE news (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  pdf_url VARCHAR(255) NULL,
  link_url VARCHAR(255) NULL,
  category VARCHAR(40) NULL,
  target_type ENUM('all','level','class') NOT NULL DEFAULT 'all',
  level_id TINYINT UNSIGNED NULL,
  class_id SMALLINT UNSIGNED NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT UNSIGNED NULL,
  CONSTRAINT fk_news_level FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
  CONSTRAINT fk_news_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Suivi de lecture
CREATE TABLE info_note_reads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  info_note_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_read (info_note_id, parent_id),
  CONSTRAINT fk_inr_note FOREIGN KEY (info_note_id) REFERENCES info_notes(id) ON DELETE CASCADE,
  CONSTRAINT fk_inr_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE news_reads (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  news_id BIGINT UNSIGNED NOT NULL,
  parent_id BIGINT UNSIGNED NOT NULL,
  read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_read (news_id, parent_id),
  CONSTRAINT fk_nr_news FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
  CONSTRAINT fk_nr_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Demandes
CREATE TABLE requests (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  type ENUM('attestation','facture','certificat','autre') NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending','completed') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE request_responses (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL,
  message TEXT NOT NULL,
  attachment_url VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rr_req FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- FCM Devices & Logs
CREATE TABLE device_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NOT NULL,
  token VARCHAR(255) NOT NULL,
  platform ENUM('android','ios','web') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_seen_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_parent_token (parent_id, token),
  CONSTRAINT fk_dt_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE notifications_log (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  kind ENUM('info_note','news','request_response') NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  target ENUM('topic','tokens') NOT NULL,
  topic VARCHAR(64) NULL,
  tokens_count INT UNSIGNED NULL,
  status_code INT NULL,
  response_text TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Admins
CREATE TABLE admins (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','staff') NOT NULL DEFAULT 'staff',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Indexes (additionnels)
CREATE INDEX idx_requests_parent_status_created ON requests (parent_id, status, created_at);
CREATE INDEX idx_info_target_pub ON info_notes (target_type, level_id, class_id, published_at);
CREATE INDEX idx_news_target_pub ON news (target_type, level_id, class_id, published_at);
CREATE INDEX idx_ps_parent ON parent_student (parent_id);
CREATE INDEX idx_ps_student ON parent_student (student_id);
