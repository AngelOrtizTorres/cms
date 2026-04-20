# API REST - CMS Laravel

## Descripción General

API REST desarrollada en **Laravel** que gestiona el contenido del CMS. Proporciona endpoints para administrar artículos, secciones, etiquetas, banners y configuración general del sitio. Recibe peticiones HTTP, consulta la base de datos y devuelve respuestas en formato **JSON**.

### Flujo de Datos

```
Frontend (React/Next.js) 
    ↓
  [HTTP Request]
    ↓
Laravel API
    ↓
  [Consulta BD]
    ↓
  [Respuesta JSON]
    ↓
Frontend (Renderiza datos)
```

**Ejemplo:** React solicita últimas noticias → API consulta BD → Devuelve JSON con artículos → Frontend renderiza contenido

---

## Características Técnicas

- **Base URL:** `http://localhost/api`
- **Protocolo:** HTTP/HTTPS
- **Formato de datos:** JSON
- **Autenticación:** Token Bearer (API token)
- **CORS:** Habilitado para solicitudes desde frontend

---

## Endpoints por Recurso

### ARTÍCULOS (Articles)

#### Listar artículos
```
GET /api/articles
```
**Descripción:** Devuelve lista paginada de artículos publicados

**Parámetros query (opcionales):**
- `page=1` - Número de página
- `per_page=15` - Artículos por página
- `sort=-created_at` - Ordenar por

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Título del artículo",
      "slug": "titulo-del-articulo",
      "excerpt": "Resumen breve del artículo",
      "content": "Contenido completo del artículo",
      "featured": true,
      "status": "published",
      "created_at": "2026-04-20T10:30:00Z",
      "updated_at": "2026-04-20T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 45,
    "per_page": 15
  }
}
```

---

#### Obtener artículo por slug
```
GET /api/articles/{slug}
```
**Descripción:** Devuelve un artículo concreto por su slug

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "title": "Título del artículo",
  "slug": "titulo-del-articulo",
  "excerpt": "Resumen breve",
  "content": "Contenido completo...",
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

---

#### Artículos destacados
```
GET /api/articles/featured
```
**Descripción:** Devuelve artículos marcados como destacados para portada

**Parámetros query (opcionales):**
- `limit=6` - Cantidad de artículos

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Noticia destacada",
      "slug": "noticia-destacada",
      "featured_image": "https://cdn.example.com/image.jpg"
    }
  ]
}
```

---

#### Crear artículo
```
POST /api/articles
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "title": "Nuevo artículo",
  "slug": "nuevo-articulo",
  "excerpt": "Resumen del artículo",
  "content": "Contenido del artículo en HTML",
  "section_id": 1,
  "tags": [1, 2, 3],
  "featured": false,
  "status": "draft"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 45,
  "title": "Nuevo artículo",
  "slug": "nuevo-articulo",
  "message": "Artículo creado exitosamente"
}
```

---

#### Actualizar artículo
```
PUT /api/articles/{id}
```
**Headers requeridos:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:** Mismo formato que POST (enviar solo campos a actualizar)

**Respuesta exitosa (200):**
```json
{
  "message": "Artículo actualizado exitosamente",
  "data": { /* artículo actualizado */ }
}
```

---

#### Eliminar artículo
```
DELETE /api/articles/{id}
```
**Headers requeridos:**
- `Authorization: Bearer {token}`

**Respuesta exitosa (204):** Sin contenido

**Respuesta (200):**
```json
{
  "message": "Artículo eliminado exitosamente"
}
```

---

### SECCIONES (Sections)

#### Listar todas las secciones
```
GET /api/sections
```
**Respuesta exitosa (200):**
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

---

#### Obtener artículos de una sección
```
GET /api/sections/{slug}
```
**Respuesta exitosa (200):**
```json
{
  "section": {
    "id": 1,
    "name": "Tecnología",
    "slug": "tecnologia"
  },
  "articles": [
    { /* listado de artículos */ }
  ]
}
```

---

#### Crear sección
```
POST /api/sections
```
**Headers requeridos:**
- `Authorization: Bearer {token}`

**Body:**
```json
{
  "name": "Nueva Sección",
  "slug": "nueva-seccion",
  "description": "Descripción de la sección"
}
```

---

#### Actualizar sección
```
PUT /api/sections/{id}
```

---

#### Eliminar sección
```
DELETE /api/sections/{id}
```

---

### ETIQUETAS (Tags)

#### Listar todas las etiquetas
```
GET /api/tags
```

#### Obtener artículos por etiqueta
```
GET /api/tags/{slug}
```

#### Crear etiqueta
```
POST /api/tags
```

#### Actualizar etiqueta
```
PUT /api/tags/{id}
```

#### Eliminar etiqueta
```
DELETE /api/tags/{id}
```

---

### BANNERS

#### Listar todos los banners activos
```
GET /api/banners
```

#### Obtener banners por posición
```
GET /api/banners/{position}
```
**Posiciones válidas:** `header`, `sidebar`, `between_articles`, `footer`

#### Crear banner
```
POST /api/banners
```
**Body:**
```json
{
  "title": "Título del banner",
  "image_url": "https://example.com/banner.jpg",
  "link_url": "https://example.com",
  "position": "header",
  "active": true
}
```

#### Actualizar banner
```
PUT /api/banners/{id}
```

#### Eliminar banner
```
DELETE /api/banners/{id}
```

---

### PORTADA (Homepage)

#### Obtener configuración de portada
```
GET /api/homepage
```
**Respuesta exitosa (200):**
```json
{
  "featured_articles": 6,
  "latest_articles": 10,
  "sections_displayed": [1, 2, 3],
  "banners_enabled": true
}
```

---

#### Actualizar configuración de portada
```
PUT /api/homepage
```
**Body:**
```json
{
  "featured_articles": 8,
  "latest_articles": 12,
  "sections_displayed": [1, 2, 3, 4]
}
```

---

### CONFIGURACIÓN (Settings)

#### Obtener configuración general del sitio
```
GET /api/settings
```
**Respuesta exitosa (200):**
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

---

#### Actualizar configuración general
```
PUT /api/settings
```
**Headers requeridos:**
- `Authorization: Bearer {token}`

---

### AVISOS (Notices)

#### Listar avisos activos
```
GET /api/notices
```

#### Crear aviso
```
POST /api/notices
```
**Body:**
```json
{
  "title": "Aviso importante",
  "message": "Contenido del aviso",
  "type": "info|warning|error|success",
  "active": true
}
```

#### Actualizar aviso
```
PUT /api/notices/{id}
```

#### Eliminar aviso
```
DELETE /api/notices/{id}
```

---

### CONTACTO (Contact)

#### Enviar formulario de contacto
```
POST /api/contact
```
**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "subject": "Consulta sobre un artículo",
  "message": "Hola, quisiera consultar sobre...",
  "phone": "+34 612 345 678" // Opcional
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Mensaje recibido correctamente. Nos pondremos en contacto pronto."
}
```

---

#### Obtener mensajes de contacto recibidos
```
GET /api/contact/messages
```
**Headers requeridos:**
- `Authorization: Bearer {token}` (Solo admin)

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "subject": "Consulta",
      "message": "Contenido del mensaje",
      "read": false,
      "created_at": "2026-04-20T10:30:00Z"
    }
  ]
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado |
| `204` | No Content - Solicitud exitosa sin contenido |
| `400` | Bad Request - Solicitud inválida |
| `401` | Unauthorized - Autenticación requerida |
| `403` | Forbidden - No tiene permisos |
| `404` | Not Found - Recurso no encontrado |
| `422` | Unprocessable Entity - Validación fallida |
| `500` | Server Error - Error del servidor |

**Respuesta de error (422):**
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

## Autenticación

Todos los endpoints que modifiquen datos (`POST`, `PUT`, `DELETE`) requieren un token de autenticación:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

Para obtener un token, use el endpoint de login:
```
POST /api/login
```

---

## Notas de Uso

- Todos los IDs son numéricos
- Los slugs deben ser únicos y en minúsculas
- Las fechas están en formato ISO 8601 (UTC)
- La paginación por defecto es de 15 elementos
- Los campos con asterisco (*) son obligatorios
 
DELETE /api/contact/messages/{id}
> borra un mensaje de contacto
 
POST   /api/media
> sube una imagen o archivo al servidor
 
GET    /api/media
> devuelve la lista de archivos subidos
 
DELETE /api/media/{id}
> borra un archivo del servidor
 
POST   /api/auth/login
> recibe email y contraseña, devuelve token de acceso
 
POST   /api/auth/logout
> invalida el token actual, cierra sesión
 
GET    /api/auth/me
> devuelve los datos del usuario autenticado
 
GET    /api/users
> devuelve la lista de usuarios registrados
 
POST   /api/users
> crea un usuario nuevo
 
PUT    /api/users/{id}
> edita un usuario existente
 
DELETE /api/users/{id}
> borra un usuario
 
GET    /api/search?q={termino}
> busca artículos por título, contenido y etiquetas
 