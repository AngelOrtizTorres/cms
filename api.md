# API REST - CMS

## Descripción General

API REST desarrollada en **Laravel** que gestiona el contenido del CMS. Proporciona endpoints para administrar artículos, secciones, etiquetas, banners, usuarios y más.

**Base URL:** `http://localhost/api`

---

## Inicio Rápido

### Configuración Base
- **Protocolo:** HTTP/HTTPS  
- **Formato:** JSON  
- **Autenticación:** Token Bearer (para POST, PUT, DELETE)

### Primer Login
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"contraseña"}'
```

Guarda el token recibido y úsalo en todas las peticiones autenticadas:
```bash
curl -H "Authorization: Bearer {token}"
```

---

## Tabla de Endpoints

| Recurso | Operación | Endpoint | Autenticación |
|---------|-----------|----------|---------------|
| **Artículos** | Listar | `GET /articles` | No |
| | Obtener uno | `GET /articles/{slug}` | No |
| | Destacados | `GET /articles/featured` | No |
| | Crear | `POST /articles` | Sí |
| | Editar | `PUT /articles/{id}` | Sí |
| | Eliminar | `DELETE /articles/{id}` | Sí |
| **Secciones** | Listar | `GET /sections` | No |
| | Por sección | `GET /sections/{slug}` | No |
| | Crear | `POST /sections` | Sí |
| | Editar | `PUT /sections/{id}` | Sí |
| | Eliminar | `DELETE /sections/{id}` | Sí |
| **Etiquetas** | Listar | `GET /tags` | No |
| | Por etiqueta | `GET /tags/{slug}` | No |
| | Crear | `POST /tags` | Sí |
| | Editar | `PUT /tags/{id}` | Sí |
| | Eliminar | `DELETE /tags/{id}` | Sí |
| **Banners** | Listar | `GET /banners` | No |
| | Por posición | `GET /banners/{position}` | No |
| | Crear | `POST /banners` | Sí |
| | Editar | `PUT /banners/{id}` | Sí |
| | Eliminar | `DELETE /banners/{id}` | Sí |
| **Búsqueda** | Buscar | `GET /search?q={term}` | No |
| **Usuario** | Datos actuales | `GET /auth/me` | Sí |
| **Usuarios** | Listar | `GET /users` | Sí (Admin) |
| | Crear | `POST /users` | Sí (Admin) |
| | Editar | `PUT /users/{id}` | Sí |
| | Eliminar | `DELETE /users/{id}` | Sí (Admin) |
| **Contacto** | Enviar | `POST /contact` | No |
| | Mensajes | `GET /contact/messages` | Sí (Admin) |
| | Eliminar | `DELETE /contact/messages/{id}` | Sí (Admin) |



---

## Documentación Detallada

### AUTENTICACIÓN

#### Login
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Response (200):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "Juan",
    "email": "usuario@example.com",
    "role": "admin"
  }
}
```

#### Logout
```
POST /api/auth/logout
```
Requiere: `Authorization: Bearer {token}`

#### Mi Perfil
```
GET /api/auth/me
```
Requiere: `Authorization: Bearer {token}`

---

### ARTÍCULOS

#### Listar Artículos
```
GET /api/articles
```

**Parámetros:**
- `page=1` - Número de página
- `per_page=15` - Artículos por página  
- `sort=-created_at` - Ordenar (ej: -created_at, title)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Título del artículo",
      "slug": "titulo-del-articulo",
      "excerpt": "Resumen breve",
      "featured": true,
      "status": "published",
      "created_at": "2026-04-20T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 45,
    "per_page": 15
  }
}
```

#### Obtener Artículo
```
GET /api/articles/{slug}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Título del artículo",
  "slug": "titulo-del-articulo",
  "excerpt": "Resumen breve",
  "content": "Contenido completo en HTML...",
  "featured": true,
  "status": "published",
  "section": {
    "id": 1,
    "name": "Tecnología",
    "slug": "tecnologia"
  },
  "tags": [
    {"id": 1, "name": "Laravel"},
    {"id": 2, "name": "API"}
  ],
  "created_at": "2026-04-20T10:30:00Z"
}
```

#### Artículos Destacados
```
GET /api/articles/featured
```

**Parámetros:**
- `limit=6` - Cantidad de artículos

#### Crear Artículo
```
POST /api/articles
```

**Requiere:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "Nuevo artículo",
  "slug": "nuevo-articulo",
  "excerpt": "Resumen del artículo",
  "content": "Contenido en HTML",
  "section_id": 1,
  "tags": [1, 2, 3],
  "featured": false,
  "status": "draft"
}
```

**Response (201):**
```json
{
  "id": 45,
  "title": "Nuevo artículo",
  "slug": "nuevo-articulo",
  "message": "Artículo creado exitosamente"
}
```

#### Editar Artículo
```
PUT /api/articles/{id}
```

**Requiere:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "message": "Artículo actualizado exitosamente",
  "data": { ... }
}
```

#### Eliminar Artículo
```
DELETE /api/articles/{id}
```

**Requiere:** `Authorization: Bearer {token}`

**Response (204):** Sin contenido

---

### SECCIONES

#### Listar Secciones
```
GET /api/sections
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Tecnología",
      "slug": "tecnologia",
      "description": "Noticias de tecnología",
      "article_count": 12
    },
    {
      "id": 2,
      "name": "Negocios",
      "slug": "negocios",
      "description": "Noticias de negocios",
      "article_count": 8
    }
  ]
}
```

#### Artículos de una Sección
```
GET /api/sections/{slug}
```

**Response (200):**
```json
{
  "section": {
    "id": 1,
    "name": "Tecnología",
    "slug": "tecnologia"
  },
  "articles": [ ... ]
}
```

#### Crear Sección
```
POST /api/sections
```

**Requiere:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "name": "Nueva Sección",
  "slug": "nueva-seccion",
  "description": "Descripción de la sección"
}
```

#### Editar Sección
```
PUT /api/sections/{id}
```

**Requiere:** `Authorization: Bearer {token}`

#### Eliminar Sección
```
DELETE /api/sections/{id}
```

**Requiere:** `Authorization: Bearer {token}`

---

### ETIQUETAS

#### Listar Etiquetas
```
GET /api/tags
```

#### Artículos por Etiqueta
```
GET /api/tags/{slug}
```

#### Crear Etiqueta
```
POST /api/tags
```

**Requiere:** `Authorization: Bearer {token}`

#### Editar Etiqueta
```
PUT /api/tags/{id}
```

**Requiere:** `Authorization: Bearer {token}`

#### Eliminar Etiqueta
```
DELETE /api/tags/{id}
```

**Requiere:** `Authorization: Bearer {token}`

---

### BANNERS

#### Listar Banners
```
GET /api/banners
```

#### Banners por Posición
```
GET /api/banners/{position}
```

**Posiciones válidas:** `header`, `sidebar`, `between_articles`, `footer`

#### Crear Banner
```
POST /api/banners
```

**Requiere:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "title": "Título del banner",
  "image_url": "https://example.com/banner.jpg",
  "link_url": "https://example.com",
  "position": "header",
  "active": true
}
```

#### Editar Banner
```
PUT /api/banners/{id}
```

**Requiere:** `Authorization: Bearer {token}`

#### Eliminar Banner
```
DELETE /api/banners/{id}
```

**Requiere:** `Authorization: Bearer {token}`

---

### MULTIMEDIA

#### Subir Archivo
```
POST /api/media
```

**Requiere:** `Authorization: Bearer {token}`

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- `file` - Archivo (imagen, PDF, etc.)

**Response (201):**
```json
{
  "id": 1,
  "filename": "imagen.jpg",
  "url": "https://example.com/uploads/imagen.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

#### Listar Archivos
```
GET /api/media
```

#### Eliminar Archivo
```
DELETE /api/media/{id}
```

**Requiere:** `Authorization: Bearer {token}`

---

### USUARIOS

#### Listar Usuarios
```
GET /api/users
```

**Requiere:** `Authorization: Bearer {token}` (Admin)

#### Crear Usuario
```
POST /api/users
```

**Requiere:** `Authorization: Bearer {token}` (Admin)

**Request:**
```json
{
  "name": "Nuevo Usuario",
  "email": "nuevo@example.com",
  "password": "contraseña_segura",
  "role": "editor"
}
```

#### Editar Usuario
```
PUT /api/users/{id}
```

**Requiere:** `Authorization: Bearer {token}`

#### Eliminar Usuario
```
DELETE /api/users/{id}
```

**Requiere:** `Authorization: Bearer {token}` (Admin)

---

### CONTACTO

#### Enviar Mensaje
```
POST /api/contact
```

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "subject": "Consulta",
  "message": "Mensaje de contacto",
  "phone": "+34 612 345 678"
}
```

**Response (201):**
```json
{
  "message": "Mensaje recibido correctamente. Nos pondremos en contacto pronto."
}
```

#### Listar Mensajes
```
GET /api/contact/messages
```

**Requiere:** `Authorization: Bearer {token}` (Admin)

#### Eliminar Mensaje
```
DELETE /api/contact/messages/{id}
```

**Requiere:** `Authorization: Bearer {token}` (Admin)

---

### BÚSQUEDA

#### Buscar Artículos
```
GET /api/search?q={termino}
```

**Parámetros:**
- `q` - Término de búsqueda (requerido)
- `limit=10` - Cantidad de resultados

**Response (200):**
```json
{
  "results": [
    {
      "id": 1,
      "title": "Título del artículo",
      "slug": "titulo-del-articulo",
      "excerpt": "Resumen del artículo"
    }
  ],
  "total": 5
}
```

---

## CONFIGURACIÓN

#### Obtener Configuración
```
GET /api/settings
```

**Response (200):**
```json
{
  "site_name": "Mi CMS",
  "site_description": "Descripción del sitio",
  "logo_url": "https://example.com/logo.png",
  "favicon_url": "https://example.com/favicon.ico",
  "contact_email": "info@example.com",
  "social_media": {
    "facebook": "https://facebook.com/example",
    "twitter": "https://twitter.com/example"
  }
}
```

#### Actualizar Configuración
```
PUT /api/settings
```

**Requiere:** `Authorization: Bearer {token}`

#### Configuración de Portada
```
GET /api/homepage
```

**Response:**
```json
{
  "featured_articles": 6,
  "latest_articles": 10,
  "sections_displayed": [1, 2, 3],
  "banners_enabled": true
}
```

#### Editar Portada
```
PUT /api/homepage
```

**Requiere:** `Authorization: Bearer {token}`

---

## CÓDIGOS DE ERROR

| Código | Significado | Solución |
|--------|------------|----------|
| **200** | OK | Solicitud exitosa |
| **201** | Created | Recurso creado correctamente |
| **204** | No Content | Eliminado correctamente (sin respuesta) |
| **400** | Bad Request | Datos inválidos o incompletos |
| **401** | Unauthorized | Token no proporcionado o inválido |
| **403** | Forbidden | No tienes permisos para esta acción |
| **404** | Not Found | Recurso no existe |
| **422** | Unprocessable Entity | Validación fallida en los datos |
| **500** | Server Error | Error del servidor |

**Ejemplo de error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": ["El título es requerido"],
    "slug": ["El slug ya existe"]
  }
}
```

---

## NOTAS IMPORTANTES

- **IDs:** Todos son numéricos
- **Slugs:** Deben ser únicos y en minúsculas (ej: `articulo-importante`)
- **Fechas:** Formato ISO 8601 UTC (ej: `2026-04-20T10:30:00Z`)
- **Paginación:** Por defecto 15 elementos por página
- **Token:** Válido por 24 horas, luego requiere nuevo login
- **CORS:** Habilitado para solicitudes desde frontend
- **Rate Limit:** 60 solicitudes por minuto por IP

---

## EJEMPLOS DE USO

### Obtener artículos de una sección
```bash
curl http://localhost/api/sections/tecnologia
```

### Buscar artículos
```bash
curl "http://localhost/api/search?q=laravel&limit=5"
```

### Crear artículo (requiere autenticación)
```bash
curl -X POST http://localhost/api/articles \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Artículo",
    "slug": "mi-articulo",
    "excerpt": "Resumen",
    "content": "<p>Contenido</p>",
    "section_id": 1,
    "status": "draft"
  }'
```

### Actualizar artículo
```bash
curl -X PUT http://localhost/api/articles/1 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

### Eliminar artículo
```bash
curl -X DELETE http://localhost/api/articles/1 \
  -H "Authorization: Bearer {token}"
```
