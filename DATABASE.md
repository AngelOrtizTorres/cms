# Base de Datos - CMS Laravel (MariaDB)

## Descripción General

Estructura completa de la base de datos para el CMS Laravel con **MariaDB**. Incluye todas las tablas necesarias para gestionar artículos, secciones, etiquetas, banners, configuración y contactos.

## Requisitos

- **MariaDB:** 10.2 o superior
- **Motor de almacenamiento:** InnoDB (para FOREIGN KEYS)
- **Charset:** utf8mb4 (soporte completo Unicode, emojis)
- **Collation:** utf8mb4_unicode_ci (comparación case-insensitive, acentos)

---

## Crear Base de Datos

```sql
CREATE DATABASE IF NOT EXISTS cms_laravel 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE cms_laravel;
```

---

## Tablas

### 1. users

Tabla para gestionar usuarios con acceso a la administración.

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100) NULL,
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_email (email),
  KEY idx_role (role),
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre del usuario
- `email`: Email único del usuario
- `email_verified_at`: Fecha de verificación de email
- `password`: Contraseña hasheada (mín. 60 caracteres)
- `remember_token`: Token para recordar sesión
- `role`: Rol del usuario (admin, editor, viewer)
- `active`: Estado del usuario (true/false)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 2. sections

Tabla para almacenar las secciones de noticias.

```sql
CREATE TABLE IF NOT EXISTS sections (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  position INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_slug (slug),
  KEY idx_active (active),
  KEY idx_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre de la sección (ej: "Tecnología", "Negocios")
- `slug`: URL amigable de la sección (ej: "tecnologia")
- `description`: Descripción de la sección
- `position`: Orden de visualización en el frontend
- `active`: Sección activa (true/false)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 3. articles

Tabla principal para almacenar artículos/noticias.

```sql
CREATE TABLE IF NOT EXISTS articles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255) NULL,
  featured BOOLEAN DEFAULT false,
  status ENUM('draft', 'scheduled', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_articles_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_slug (slug),
  KEY idx_status (status),
  KEY idx_published_at (published_at),
  KEY idx_section_id (section_id),
  KEY idx_user_id (user_id),
  KEY idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `section_id`: Referencia a la sección (FK)
- `user_id`: Autor del artículo (FK)
- `title`: Título del artículo
- `slug`: URL amigable del artículo
- `excerpt`: Resumen breve (para listados)
- `content`: Contenido completo (HTML permitido)
- `featured_image`: URL de la imagen destacada
- `featured`: Marcado como destacado para portada
- `status`: Estado (draft, scheduled, published, archived)
- `published_at`: Fecha/hora de publicación
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 4. tags

Tabla para almacenar etiquetas.

```sql
CREATE TABLE IF NOT EXISTS tags (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_slug (slug),
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre de la etiqueta
- `slug`: URL amigable
- `description`: Descripción de la etiqueta
- `active`: Etiqueta activa (true/false)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 5. article_tag

Tabla pivote para relación many-to-many entre artículos y etiquetas.

```sql
CREATE TABLE IF NOT EXISTS article_tag (
  article_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT fk_article_tag_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tag_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `article_id`: Referencia al artículo (FK, parte de PK)
- `tag_id`: Referencia a la etiqueta (FK, parte de PK)
- `created_at`: Fecha de creación de la relación

---

### 6. banners

Tabla para almacenar banners publicitarios.

```sql
CREATE TABLE IF NOT EXISTS banners (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255) NULL,
  position ENUM('header', 'sidebar', 'between_articles', 'footer') NOT NULL,
  display_order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  clicks INT UNSIGNED DEFAULT 0,
  impressions INT UNSIGNED DEFAULT 0,
  starts_at TIMESTAMP NULL,
  ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_position (position),
  KEY idx_active (active),
  KEY idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `title`: Título del banner
- `image_url`: URL de la imagen del banner
- `link_url`: URL destino al hacer clic
- `position`: Posición en el sitio (header, sidebar, between_articles, footer)
- `display_order`: Orden de visualización en la posición
- `active`: Banner activo (true/false)
- `clicks`: Número de clics registrados
- `impressions`: Número de impresiones registradas
- `starts_at`: Fecha/hora de inicio de visualización
- `ends_at`: Fecha/hora de fin de visualización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 7. homepage_config

Tabla para almacenar la configuración de la portada (singleton - un único registro).

```sql
CREATE TABLE IF NOT EXISTS homepage_config (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  featured_articles_count INT UNSIGNED DEFAULT 6,
  latest_articles_count INT UNSIGNED DEFAULT 10,
  sections_displayed JSON NULL,
  banners_enabled BOOLEAN DEFAULT true,
  show_notices BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT uc_homepage_config_single CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración por defecto
INSERT IGNORE INTO homepage_config (id, featured_articles_count, latest_articles_count) 
VALUES (1, 6, 10);
```

**Campos:**
- `id`: Identificador único (siempre 1)
- `featured_articles_count`: Cantidad de artículos destacados en portada
- `latest_articles_count`: Cantidad de últimas noticias en portada
- `sections_displayed`: JSON con IDs de secciones a mostrar (ej: [1,2,3])
- `banners_enabled`: Mostrar banners en portada
- `show_notices`: Mostrar avisos en portada
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 8. settings

Tabla para almacenar configuración general del sitio (singleton - un único registro).

```sql
CREATE TABLE IF NOT EXISTS settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Mi CMS',
  site_description TEXT NULL,
  logo_url VARCHAR(255) NULL,
  favicon_url VARCHAR(255) NULL,
  contact_email VARCHAR(255) NULL,
  phone_number VARCHAR(20) NULL,
  address TEXT NULL,
  facebook_url VARCHAR(255) NULL,
  twitter_url VARCHAR(255) NULL,
  instagram_url VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  youtube_url VARCHAR(255) NULL,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT uc_settings_single CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración por defecto
INSERT IGNORE INTO settings (id, site_name) VALUES (1, 'Mi CMS');
```

**Campos:**
- `id`: Identificador único (siempre 1)
- `site_name`: Nombre del sitio
- `site_description`: Descripción del sitio (meta description)
- `logo_url`: URL del logo
- `favicon_url`: URL del favicon
- `contact_email`: Email de contacto
- `phone_number`: Número de teléfono
- `address`: Dirección física
- `facebook_url`: Enlace a Facebook
- `twitter_url`: Enlace a Twitter
- `instagram_url`: Enlace a Instagram
- `linkedin_url`: Enlace a LinkedIn
- `youtube_url`: Enlace a YouTube
- `maintenance_mode`: Modo mantenimiento activo
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 9. notices

Tabla para almacenar avisos/notificaciones del sitio.

```sql
CREATE TABLE IF NOT EXISTS notices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  dismissible BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  starts_at TIMESTAMP NULL,
  ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_active (active),
  KEY idx_type (type),
  KEY idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `title`: Título del aviso
- `message`: Contenido del aviso
- `type`: Tipo de aviso (info, warning, error, success)
- `active`: Aviso visible
- `dismissible`: Puede ser cerrado por el usuario
- `priority`: Prioridad de visualización (mayor = más arriba)
- `starts_at`: Fecha/hora de inicio de visualización
- `ends_at`: Fecha/hora de fin de visualización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 10. contact_messages

Tabla para almacenar mensajes de contacto.

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  reply_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_email (email),
  KEY idx_read (read),
  KEY idx_created_at (created_at),
  KEY idx_replied (replied)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre del remitente
- `email`: Email del remitente
- `phone_number`: Número de teléfono del remitente
- `subject`: Asunto del mensaje
- `message`: Contenido del mensaje
- `read`: Mensaje leído por administrador
- `replied`: Se ha respondido al mensaje
- `reply_message`: Respuesta del administrador
- `created_at`: Fecha de recepción
- `updated_at`: Fecha de última actualización

---

## Diagramas de Relaciones

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ name        │
│ email       │
│ password    │
│ role        │
└─────────────┘
       │
       ├─────────────────────────┐
       ▼                         ▼
┌─────────────────┐      ┌──────────────┐
│   articles      │      │  sections    │
├─────────────────┤      ├──────────────┤
│ id (PK)         │      │ id (PK)      │
│ user_id (FK)    │      │ name         │
│ section_id (FK) │      │ slug         │
│ title           │      │ description  │
│ slug            │      │ position     │
│ content         │      │ active       │
│ featured        │      └──────────────┘
│ status          │
│ published_at    │
└─────────────────┘
       │
       └──────────────────────────┐
                                  ▼
                         ┌──────────────────┐
                         │  article_tag     │
                         ├──────────────────┤
                         │ id (PK)          │
                         │ article_id (FK)  │
                         │ tag_id (FK)      │
                         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     tags         │
                         ├──────────────────┤
                         │ id (PK)          │
                         │ name             │
                         │ slug             │
                         │ description      │
                         │ active           │
                         └──────────────────┘

┌──────────────┐      ┌──────────────────┐      ┌────────────────┐
│   banners    │      │ homepage_config  │      │   settings     │
├──────────────┤      ├──────────────────┤      ├────────────────┤
│ id (PK)      │      │ id (PK)          │      │ id (PK)        │
│ title        │      │ featured_count   │      │ site_name      │
│ image_url    │      │ latest_count     │      │ logo_url       │
│ link_url     │      │ sections_display │      │ contact_email  │
│ position     │      │ banners_enabled  │      │ social_media   │
│ active       │      └──────────────────┘      └────────────────┘
│ starts_at    │
│ ends_at      │
└──────────────┘

┌─────────────────┐      ┌──────────────────┐
│    notices      │      │ contact_messages │
├─────────────────┤      ├──────────────────┤
│ id (PK)         │      │ id (PK)          │
│ title           │      │ name             │
│ message         │      │ email            │
│ type            │      │ subject          │
│ active          │      │ message          │
│ starts_at       │      │ read             │
│ ends_at         │      │ replied          │
└─────────────────┘      │ reply_message    │
                         │ created_at       │
                         └──────────────────┘
```

---

## Índices Optimizados

Se han creado índices para optimizar consultas frecuentes:

| Tabla | Índice | Propósito |
|-------|--------|----------|
| users | idx_email | Búsqueda por email |
| users | idx_role | Filtrado por rol |
| users | idx_active | Filtrado de usuarios activos |
| sections | idx_slug | Búsqueda por URL amigable |
| sections | idx_active | Filtrado de secciones activas |
| sections | idx_position | Ordenamiento por posición |
| articles | idx_slug | Búsqueda por URL amigable |
| articles | idx_status | Filtrado por estado |
| articles | idx_published_at | Ordenamiento por fecha |
| articles | idx_section_id | Artículos por sección |
| articles | idx_user_id | Artículos por autor |
| articles | idx_featured | Artículos destacados |
| tags | idx_slug | Búsqueda por URL amigable |
| tags | idx_active | Filtrado de etiquetas activas |
| banners | idx_position | Banners por posición |
| banners | idx_active | Filtrado de banners activos |
| banners | idx_display_order | Ordenamiento de visualización |
| notices | idx_active | Avisos activos |
| notices | idx_type | Filtrado por tipo |
| notices | idx_priority | Ordenamiento por prioridad |
| contact_messages | idx_email | Búsqueda por email |
| contact_messages | idx_read | Filtrado de no leídos |
| contact_messages | idx_created_at | Ordenamiento cronológico |
| contact_messages | idx_replied | Filtrado de sin responder |

---

## Migraciones Laravel

Los comandos Artisan para crear las migraciones serían:

```bash
php artisan make:model User -m
php artisan make:model Section -m
php artisan make:model Article -m
php artisan make:model Tag -m
php artisan make:model Banner -m
php artisan make:model Notice -m
php artisan make:model ContactMessage -m
php artisan make:model HomepageConfig -m
php artisan make:model Setting -m
```

---

## Relaciones en Laravel

Las relaciones entre modelos serían:

**User.php**
```php
public function articles() {
    return $this->hasMany(Article::class);
}
```

**Article.php**
```php
public function user() {
    return $this->belongsTo(User::class);
}

public function section() {
    return $this->belongsTo(Section::class);
}

public function tags() {
    return $this->belongsToMany(Tag::class, 'article_tag');
}
```

**Section.php**
```php
public function articles() {
    return $this->hasMany(Article::class);
}
```

**Tag.php**
```php
public function articles() {
    return $this->belongsToMany(Article::class, 'article_tag');
}
```

---

## Notas Importantes

### Diseño de Base de Datos
- **Charset:** Todas las tablas usan `utf8mb4` para soporte completo de caracteres Unicode y emojis
- **Collation:** `utf8mb4_unicode_ci` para comparación case-insensitive con acentos correctamente
- **Motor:** InnoDB obligatorio para FOREIGN KEYS y transacciones
- **Timestamps:** Todas las tablas tienen `created_at` y `updated_at` para auditoría completa

### Campos Especiales
- **Slugs:** Campos únicos para URLs amigables (ej: "/articles/mi-primer-articulo")
- **Status de artículos:** draft (borrador), scheduled (programado), published (publicado), archived (archivado)
- **Posiciones de banners:** header (cabecera), sidebar (barra lateral), between_articles (entre noticias), footer (pie)
- **Tipos de avisos:** info, warning, error, success
- **Roles de usuarios:** admin (administrador), editor (editor de contenido), viewer (solo lectura)

### Tablas Especiales
- **Tabla pivote `article_tag`:** Relación many-to-many entre artículos y etiquetas sin ID autoincremental
- **Tablas singleton:** `homepage_config` y `settings` solo deben tener un registro (id=1) con CHECK CONSTRAINT
- **Valores por defecto:** Se inserta automáticamente en homepage_config y settings

### Integridad Referencial
- Se utilizan FOREIGN KEYS con nombres explícitos para mantener integridad referencial
- Configurado `ON DELETE CASCADE` para eliminar datos relacionados automáticamente
- Todos los CONSTRAINTS tienen nombres descriptivos para facilitar mantenimiento

### Optimizaciones
- Índices en campos frecuentemente buscados (slugs, emails, estados)
- Índices en campos con filtros frecuentes (active, type, position)
- Índices en campos de ordenamiento (published_at, position, priority)
- Índices en claves foráneas para mejorar JOINs

### Seguridad
- Las contraseñas deben hashearse con bcrypt (mín. 60 caracteres para almacenamiento)
- Email verificado mediante timestamp null/no null
- Modo mantenimiento para pausar el sitio si es necesario
- Sistema de lectura/respuesta para mensajes de contacto

### Campos Numéricos
- IDs: BIGINT UNSIGNED (soporta hasta 2^64-1 registros)
- Posiciones/órdenes: INT (suficiente para ordenamientos)
- Clics/impresiones: INT UNSIGNED para contadores no negativos
- Prioridad: INT (permite valores negativos si es necesario)
- Conteos: INT UNSIGNED para valores siempre positivos

### JSON Fields
- `sections_displayed` en homepage_config: Array de IDs de secciones (ej: `[1,2,3,4]`)
- Permite flexibilidad futura para configuraciones complejas

---

## Script SQL Completo (MariaDB)

Para crear todas las tablas de una vez, ejecuta:

```bash
mysql -u root -p cms_laravel < schema.sql
```

O en la consola de MariaDB:
```sql
USE cms_laravel;
SOURCE /ruta/al/archivo/schema.sql;
```

O simplemente copia y pega todo el SQL de cada tabla en orden.