# Base de Datos - CMS Laravel (MariaDB)

## Descripción General

Estructura completa de la base de datos para el CMS Laravel con **MariaDB**. Incluye todas las tablas necesarias para gestionar artículos, secciones, etiquetas, banners, configuración y contactos.

## Requisitos

- **MariaDB:** 10.2 o superior
- **Motor de almacenamiento:** InnoDB (para FOREIGN KEYS)
- **Collation:** utf8mb4_unicode_ci (soporte completo Unicode)

---

## Tablas

### 1. users

Tabla para gestionar usuarios con acceso a la administración.

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100),
  role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_email (email),
  KEY idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

**Campos:**
- `id`: Identificador único
- `name`: Nombre del usuario
- `email`: Email único del usuario
- `email_verified_at`: Fecha de verificación de email
- `password`: Contraseña hasheada
- `remember_token`: Token para recordar sesión
- `role`: Rol del usuario (admin, editor, viewer)
- `active`: Estado del usuario
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 2. sections

Tabla para almacenar las secciones de noticias.

```sql
CREATE TABLE sections (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  position INT DEFAULT 0,
  active BOOLEAN DEFAULT true,,
  
  KEY idx_slug (slug),
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;pdated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre de la sección
- `slug`: URL amigable de la sección
- `description`: Descripción de la sección
- `position`: Orden de visualización
- `active`: Sección activa
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 3. articles

Tabla principal para almacenar artículos/noticias.

```sql
CREATE TABLE articles (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  section_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(255),
  featured BOOLEAN DEFAULT false,
  status ENUM('draft', 'scheduled', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_slug (slug),
  KEY idx_status (status),
  KEY idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;NDEX idx_published_at (published_at)
);
```

**Campos:**
- `id`: Identificador único
- `section_id`: Referencia a la sección
- `user_id`: Autor del artículo
- `title`: Título del artículo
- `slug`: URL amigable
- `excerpt`: Resumen breve
- `content`: Contenido completo (HTML)
- `featured_image`: Imagen destacada
- `featured`: Marcado como destacado para portada
- `status`: Estado del artículo
- `published_at`: Fecha de publicación
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 4. tags

Tabla para almacenar etiquetas.

```sql
CREATE TABLE tags (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,,
  
  KEY idx_slug (slug),
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**
- `id`: Identificador único
- `name`: Nombre de la etiqueta
- `slug`: URL amigable
- `description`: Descripción de la etiqueta
- `active`: Etiqueta activa
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 5. article_tag

Tabla pivote para relación many-to-many entre artículos y etiquetas.

```sql
CREATE TABLE article_tag (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  article_id BIGINT UNSIGNED NOT NULL,
  CONSTRAINT fk_article_tag_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  CONSTRAINT fk_article_tag_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_article_tag (article_id, tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;OREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE KEY unique_article_tag (article_id, tag_id)
);
```

**Campos:**
- `id`: Identificador único
- `article_id`: Referencia al artículo
- `tag_id`: Referencia a la etiqueta
- `created_at`: Fecha de creación

---

### 6. banners

Tabla para almacenar banners publicitarios.

```sql
CREATE TABLE banners (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255),
  position ENUM('header', 'sidebar', 'between_articles', 'footer') NOT NULL,
  order INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  starts_at TIMESTAMP NULL,
  ends_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY idx_position (position),
  KEY idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

**Campos:**
- `id`: Identificador único
- `title`: Título del banner
- `image_url`: URL de la imagen
- `link_url`: URL destino del banner
- `position`: Posición en el sitio
- `order`: Orden de visualización
- `active`: Banner activo
- `clicks`: Número de clics
- `impressions`: Número de impresiones
- `starts_at`: Fecha de inicio
- `ends_at`: Fecha de finalización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 7. homepage_config

Tabla para almacenar la configuración de la portada.

```sql
CREATE TABLE homepage_config (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  featured_articles_count INT DEFAULT 6,
  latest_articles_count INT DEFAULT 10,
  sections_displayed JSON,
  banners_enabled BOOLEAN DEFAULT true,
  show_notices BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY only_one_config (id)
);
` ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
**Campos:**
- `id`: Identificador único (siempre 1)
- `featured_articles_count`: Cantidad de artículos destacados
- `latest_articles_count`: Cantidad de últimas noticias
- `sections_displayed`: JSON con IDs de secciones a mostrar
- `banners_enabled`: Mostrar banners
- `show_notices`: Mostrar avisos
- `updated_at`: Fecha de última actualización

---

### 8. settings

Tabla para almacenar configuración general del sitio.

```sql
CREATE TABLE settings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  site_name VARCHAR(255) NOT NULL,
  site_description TEXT,
  logo_url VARCHAR(255),
  favicon_url VARCHAR(255),
  contact_email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  maintenance_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY only_one_settings (id)
);
` ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
**Campos:**
- `id`: Identificador único (siempre 1)
- `site_name`: Nombre del sitio
- `site_description`: Descripción del sitio
- `logo_url`: URL del logo
- `favicon_url`: URL del favicon
- `contact_email`: Email de contacto
- `phone_number`: Número de teléfono
- `address`: Dirección física
- `facebook_url`: URL de Facebook
- `twitter_url`: URL de Twitter
- `instagram_url`: URL de Instagram
- `linkedin_url`: URL de LinkedIn
- `youtube_url`: URL de YouTube
- `maintenance_mode`: Modo mantenimiento
- `updated_at`: Fecha de última actualización

---

### 9. notices

Tabla para almacenar avisos/notificaciones del sitio.

```sql
CREATE TABLE notices (
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
  
  INDEX idx_active (active),
  INDEX idx_type (type)
);KEY idx_active (active),
  KEY idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;ampos:**
- `id`: Identificador único
- `title`: Título del aviso
- `message`: Contenido del aviso
- `type`: Tipo de aviso (info, warning, error, success)
- `active`: Aviso activo
- `dismissible`: Puede ser cerrado por el usuario
- `priority`: Prioridad de visualización
- `starts_at`: Fecha de inicio
- `ends_at`: Fecha de finalización
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 10. contact_messages

Tabla para almacenar mensajes de contacto.

```sql
CREATE TABLE contact_messages (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  reply_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_read (read),
  INDEX idx_created_at (created_at)
);
```
KEY idx_email (email),
  KEY idx_read (read),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;email`: Email del remitente
- `phone_number`: Número de teléfono (opcional)
- `subject`: Asunto del mensaje
- `message`: Contenido del mensaje
- `read`: Mensaje leído
- `replied`: Se ha respondido
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

## Índices Importantes

Para optimizar las queries, se han creado los siguientes índices:

- `articles.slug`: Búsqueda rápida por slug
- `articles.status`: Filtrado por estado
- `articles.published_at`: Ordenamiento por fecha
- `banners.position`: Consultas por posición
- `banners.active`: Filtrado de banners activos
- `contact_messages.email`: Búsqueda de mensajes por email
- `contact_messages.read`: Filtrado de mensajes leídos
- `contact_messages.created_at`: Ordenamiento cronológico
- `notices.active`: Filtrado de avisos activos
- `tags.slug`: Búsqueda rápida por slug
- `sections.slug`: Búsqueda rápida por slug

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

- Todas las tablas tienen campos `created_at` y `updated_at` para auditoría
- Los slugs son únicos y permiten URLs amigables
- La tabla `homepage_config` y `settings` solo debe tener un registro (id = 1)
- Las relaciones many-to-many se implementan con la tabla pivote `article_tag`
- Se utilizan FOREIGN KEYS para mantener integridad referencial
- Los campos JSON permiten flexibilidad en configuraciones futuras
- Motor de almacenamiento: **InnoDB** (obligatorio para FOREIGN KEYS)
- Juego de caracteres: **utf8mb4** (soporte completo Unicode, emojis, caracteres especiales)
- Collation: **utf8mb4_unicode_ci** (comparación case-insensitive, acentos)
- Los slugs son únicos y permiten URLs amigables
- La tabla `homepage_config` y `settings` solo debe tener un registro (id = 1)
- Las relaciones many-to-many se implementan con la tabla pivote `article_tag`
- Se utilizan FOREIGN KEYS con nombres explícitos para mantener integridad referencial
- Los campos JSON permiten flexibilidad en configuraciones futuras
- Los ENUMs aseguran valores válidos en campos con opciones limitadas
- Se han nombrado explícitamente los CONSTRAINTS para facilitar mantenimiento

## Script SQL Completo (MariaDB)

Para crear todas las tablas de una vez, ejecuta:

```bash
mysql -u usuario -p nombre_bbdd < schema.sql
```

O en la consola de MariaDB:
```sql
SOURCE /ruta/al/archivo/schema.sql;
```