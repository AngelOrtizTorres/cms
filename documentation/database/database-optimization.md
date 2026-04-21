# Optimización de la Base de Datos

## **Índice**
1. [Optimización realizada](#optimización-realizada)
2. [Optimizaciones futuras](#optimizaciones-futuras)

## Optimización realizada

### Índices compuestos orientados al aguante de consultas de alta frecuencia y carga de lectura:

Se diseñaron índices específicos para los patrones de lectura más frecuentes:

- `users.idx_status (active, deleted_at)` para autenticación y filtrado de cuentas operativas.
- `users.idx_role (role)` para panel administrativo por perfiles.
- `sections.idx_active_position (active, position, deleted_at)` para menús ordenados.
- `articles.idx_status_published (status, published_at, deleted_at)` para home y feed principal.
- `articles.idx_section_status_date (section_id, status, published_at)` para listados por sección.
- `articles.idx_featured_status (featured, status)` para contenidos destacados.
- `articles.idx_user_id (user_id)` para panel de autoría.
- `tags.idx_active_status (active, deleted_at)` para filtros de etiquetas vigentes.
- `article_tag.idx_tag_id (tag_id)` para búsqueda inversa por etiqueta.
- `banners.idx_position_active_order (position, active, display_order, deleted_at)` para rendering publicitario.
- `notices.idx_active_priority_dates (active, priority, starts_at, ends_at, deleted_at)` para avisos activos y vigencia.
- `contact_messages.idx_email (email)` y `contact_messages.idx_status_created (status, created_at)` para gestión de bandeja.
- `media.idx_user_id (user_id)`, `media.idx_mime_type_folder (mime_type, folder)` y `media.idx_created_at (created_at)` para biblioteca de archivos.
- `comments.idx_tree_load (commentable_type, commentable_id, status, path)` para árbol de comentarios polimórfico.
- `comments.idx_analytics_score (commentable_type, commentable_id, score DESC)` para priorización por engagement.
- `pages.idx_status_position (status, position, deleted_at)` para menús y footer.
- `audit_logs.idx_auditable_model (auditable_type, auditable_id)`, `audit_logs.idx_user_action (user_id, created_at)` y `audit_logs.idx_created_at (created_at)` para auditoría.

### Uso de tipos adecuados para un mejor rendimiento y escalabilidad:

- Uso consistente de `BIGINT UNSIGNED` en entidades principales para evitar cuellos por crecimiento.
- Uso de `Soft Deletes` (`deleted_at`) en tablas críticas para mantener trazabilidad y recuperación.
- Tablas singleton (`homepage_config`, `settings`) para evitar sobrecarga de joins en configuración global.
- Campos JSON donde aporta flexibilidad (`layout_schema`, `social_links`, `target_pages`, `old_values`, `new_values`) sin forzar migraciones constantes.

### Referencias y relaciones explícitas:

- Todas las relaciones principales tienen `FOREIGN KEY` explícitas.
- Políticas de borrado diseñadas por caso de uso:
	- `CASCADE` en pivotes (`article_tag`) para limpieza automática.
	- `SET NULL` en recursos históricos (`media`, `audit_logs`, `comments`) para preservar registros.
	- `RESTRICT` en entidades núcleo (`articles` con `users`/`sections`) para proteger consistencia editorial.

---

## Optimizaciones futuras

### Vistas materializadas simuladas

Debido a que de forma nativa MariaDB no soporta vistas materializadas, se pueden implementar tablas de resumen actualizadas periódicamente mediante eventos programados o tareas cron para consultas de alta carga:

### Caching

Para que en producción, no haya problemas de rendimiento, se podría implementar caching a nivel de aplicación para consultas frecuentes y resultados que no cambian constantemente. Esto puede incluir:
- Cache de resultados de consultas complejas o agregaciones.
- Cache de objetos individuales (por ejemplo, detalles de un artículo o usuario) para reducir la carga en la base de datos.
- Cache de páginas completas o fragmentos de páginas para mejorar tiempos de respuesta en el frontend.