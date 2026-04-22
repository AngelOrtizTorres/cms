CREATE DATABASE IF NOT EXISTS cms_vertex
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE cms_vertex;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
  active BOOLEAN DEFAULT true,
  avatar_url VARCHAR(255) NULL,
  last_login_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role (role),
  KEY idx_status (active, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sections (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(160) NULL,
  position INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_parent FOREIGN KEY (parent_id) REFERENCES sections(id) ON DELETE SET NULL,
  KEY idx_active_position (active, position, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255) NULL,
  gallery_images JSON NULL,
  featured BOOLEAN DEFAULT false,
  status ENUM('draft', 'scheduled', 'published', 'archived') DEFAULT 'draft',
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(160) NULL,
  published_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE RESTRICT,
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_status_published (status, published_at, deleted_at),
  KEY idx_section_status_date (section_id, status, published_at),
  KEY idx_featured_status (featured, status),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description VARCHAR(160) NULL,
  active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_active_status (active, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_section (
  article_id BIGINT UNSIGNED NOT NULL,
  section_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, section_id),
  CONSTRAINT fk_article_section_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_section_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  KEY idx_section_id (section_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_tag (
  article_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT fk_article_tag_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tag_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  KEY idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Mi CMS',
  site_description VARCHAR(160) NULL,
  logo_url VARCHAR(255) NULL,
  favicon_url VARCHAR(255) NULL,
  brand_color VARCHAR(7) DEFAULT '#000000',
  contact_email VARCHAR(255) NULL,
  phone_number VARCHAR(20) NULL,
  address TEXT NULL,
  social_links JSON NULL,
  google_analytics_id VARCHAR(50) NULL,
  facebook_pixel_id VARCHAR(50) NULL,
  header_scripts TEXT NULL,
  footer_scripts TEXT NULL,
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uc_settings_single CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO settings (id, site_name, social_links)
VALUES (1, 'Mi CMS', '{}');

CREATE TABLE IF NOT EXISTS notices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  dismissible BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  link_label VARCHAR(50) NULL,
  link_url VARCHAR(255) NULL,
  target_pages JSON NULL,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP NULL,
  ends_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_active_priority_dates (active, priority, starts_at, ends_at, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied', 'archived', 'spam') DEFAULT 'new',
  reply_message TEXT NULL,
  replied_at TIMESTAMP NULL,
  internal_notes TEXT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  source_url VARCHAR(255) NULL,
  privacy_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  disk VARCHAR(50) DEFAULT 'public',
  mime_type VARCHAR(100),
  size BIGINT UNSIGNED,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  alt_text VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  folder VARCHAR(100) DEFAULT '/',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_user_id (user_id),
  KEY idx_mime_type_folder (mime_type, folder),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  parent_id BIGINT UNSIGNED NULL,
  path VARCHAR(255) NOT NULL,
  depth TINYINT UNSIGNED DEFAULT 0,
  commentable_id BIGINT UNSIGNED NOT NULL,
  commentable_type VARCHAR(255) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
  reply_count INT UNSIGNED DEFAULT 0,
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  score INT AS (upvotes - downvotes) VIRTUAL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_tree_load (commentable_type, commentable_id, status, path),
  KEY idx_analytics_score (commentable_type, commentable_id, score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  auditable_type VARCHAR(255) NOT NULL,
  auditable_id BIGINT UNSIGNED NOT NULL,
  action ENUM('create', 'update', 'delete', 'restore') NOT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_auditable_model (auditable_type, auditable_id),
  KEY idx_user_action (user_id, created_at),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;