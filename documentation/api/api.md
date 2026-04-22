# API REST - CMS

## Descripción General

API REST desarrollada en **Laravel** que gestiona el contenido del CMS. Proporciona endpoints para administrar artículos, secciones, etiquetas, banners, usuarios y más.

**Base URL:** `http://localhost/api`

---

## Inicio Rápido

### Configuración Base
- **Protocolo:** HTTP/HTTPS  
- **Formato:** JSON  
- **Autenticación:** Token Bearer (requerido para operaciones que modifiquen datos)

### Autenticación
Todas las operaciones de lectura (GET) son públicas. Para crear, editar o eliminar recursos (POST, PUT, DELETE), primero debes obtener un token mediante login. El token se envía en el header: `Authorization: Bearer {tu-token-aqui}` y es válido por 24 horas.

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
Envía email y contraseña. Devuelve un token JWT que debe guardarse en el cliente (localStorage/cookies) y un objeto con datos del usuario (id, nombre, email, rol). Este token expira en 24 horas.

#### Logout
```
POST /api/auth/logout
```
Invalida el token actual. Requiere autenticación.

#### Mi Perfil
```
GET /api/auth/me
```
Obtiene los datos del usuario autenticado actualmente. Requiere autenticación.

---

### ARTÍCULOS

#### Listar Artículos
```
GET /api/articles?page=1&per_page=15&sort=-created_at
```
Devuelve una lista paginada de artículos. Parámetros opcionales: `page` (número de página), `per_page` (cantidad por página), `sort` (ordenamiento, usa `-` para descendente ej: `-created_at`). Cada artículo incluye: id, título, slug (url-amigable), resumen, estado (draft/published), flag destacado y fecha de creación.

#### Obtener un Artículo
```
GET /api/articles/{slug}
```
Obtiene el artículo completo con contenido HTML, sección relacionada, etiquetas asociadas, y metadatos. Se accede por slug (no por ID).

#### Artículos Destacados
```
GET /api/articles/featured?limit=6
```
Devuelve los artículos marcados como destacados. Útil para portadas. Parámetro opcional `limit` para la cantidad.

#### Crear Artículo
```
POST /api/articles
```
**Requiere autenticación.** Campos necesarios: `title` (texto), `slug` (único), `excerpt` (resumen), `content` (HTML), `section_id` (ID de la sección). Opcionales: `tags` (array de IDs), `featured` (booleano), `status` (draft o published). Devuelve el artículo creado con su ID asignado.

#### Editar Artículo
```
PUT /api/articles/{id}
```
**Requiere autenticación.** Permite actualizar cualquier campo. Devuelve el artículo actualizado completo.

#### Eliminar Artículo
```
DELETE /api/articles/{id}
```
**Requiere autenticación.** Elimina permanentemente el artículo. Devuelve 204 sin contenido si tiene éxito.

---

### SECCIONES

Secciones son categorías para organizar artículos. Cada artículo pertenece a una sección.

#### Listar Secciones
```
GET /api/sections
```
Devuelve todas las secciones con: id, nombre, slug, descripción y cantidad de artículos en cada una.

#### Artículos de una Sección
```
GET /api/sections/{slug}
```
Devuelve la sección y todos los artículos que contiene.

#### Crear Sección
```
POST /api/sections
```
**Requiere autenticación.** Campos: `name` (nombre), `slug` (único), `description` (descripción). Devuelve la sección creada.

#### Editar/Eliminar Sección
```
PUT /api/sections/{id}
DELETE /api/sections/{id}
```
**Requiere autenticación.** Actualiza o elimina la sección respectivamente.

---

### ETIQUETAS

Etiquetas permiten clasificar artículos de forma flexible, complementando a las secciones.

#### Listar Etiquetas
```
GET /api/tags
```
Devuelve todas las etiquetas disponibles.

#### Artículos por Etiqueta
```
GET /api/tags/{slug}
```
Devuelve todos los artículos que tienen una etiqueta específica.

#### Crear/Editar/Eliminar Etiqueta
```
POST /api/tags
PUT /api/tags/{id}
DELETE /api/tags/{id}
```
**Requiere autenticación (admin).** Campos para crear: `name` (nombre), `slug` (único). CRUD completo de etiquetas.

---

### BANNERS

Banners son promociones o anuncios que se muestran en diferentes posiciones del sitio.

#### Listar Banners
```
GET /api/banners
```
Devuelve todos los banners activos e inactivos.

#### Banners por Posición
```
GET /api/banners/{position}
```
Obtiene banners de una posición específica: `header`, `sidebar`, `between_articles` o `footer`.

#### Crear/Editar/Eliminar Banner
```
POST /api/banners
PUT /api/banners/{id}
DELETE /api/banners/{id}
```
**Requiere autenticación.** Campos para crear: `title`, `image_url`, `link_url`, `position`, `active` (booleano).

---

### MULTIMEDIA

Gestiona archivos subidos (imágenes, PDFs, etc.).

#### Subir Archivo
```
POST /api/media
```
**Requiere autenticación.** Envía un archivo usando `multipart/form-data`. Devuelve: id, nombre del archivo, URL pública, tamaño y tipo MIME.

#### Listar Archivos
```
GET /api/media
```
**Requiere autenticación.** Lista todos los archivos subidos por el usuario.

#### Eliminar Archivo
```
DELETE /api/media/{id}
```
**Requiere autenticación.** Elimina el archivo del servidor.

---

### BÚSQUEDA

#### Buscar Artículos
```
GET /api/search?q={termino}&limit=10
```
Búsqueda global de artículos por término. Devuelve resultados con id, título, slug y resumen. Parámetro `limit` controla la cantidad de resultados (default 10).

---

### USUARIOS

Solo accesible por administradores.

#### Listar Usuarios
```
GET /api/users
```
**Requiere autenticación (admin).** Lista todos los usuarios del sistema.

#### Crear Usuario
```
POST /api/users
```
**Requiere autenticación (admin).** Campos: `name`, `email`, `password`, `role` (admin, editor, etc.).

#### Editar/Eliminar Usuario
```
PUT /api/users/{id}
DELETE /api/users/{id}
```
**Requiere autenticación.** Cualquier usuario puede editar sus propios datos. Solo admin puede eliminar usuarios.

---

### CONTACTO

#### Enviar Mensaje
```
POST /api/contact
```
**Sin autenticación requerida.** Campos: `name`, `email`, `subject`, `message`, `phone` (opcional). Los mensajes se guardan en la base de datos para que el administrador pueda leerlos.

#### Listar Mensajes
```
GET /api/contact/messages
```
**Requiere autenticación (admin).** Lista todos los mensajes de contacto recibidos.

#### Eliminar Mensaje
```
DELETE /api/contact/messages/{id}
```
**Requiere autenticación (admin).** Elimina un mensaje específico.

---

### CONFIGURACIÓN

#### Obtener Configuración General
```
GET /api/settings
```
Obtiene configuración global del sitio: nombre, descripción, logo, favicon, email de contacto, redes sociales.

#### Actualizar Configuración
```
PUT /api/settings
```
**Requiere autenticación (admin).** Actualiza la configuración del sitio.

#### Configuración de Portada
```
GET /api/homepage
PUT /api/homepage
```
GET devuelve configuración de la página de inicio (cantidad de artículos destacados, secciones mostradas, etc.). PUT actualiza estas configuraciones (requiere autenticación).

---

## CÓDIGOS DE ERROR

| Código | Significado |
|--------|-----------|
| **200** | OK - Solicitud exitosa |
| **201** | Creado - Recurso creado exitosamente |
| **204** | Sin contenido - Eliminación exitosa |
| **400** | Bad Request - Datos inválidos o incompletos |
| **401** | No autorizado - Token ausente o expirado |
| **403** | Prohibido - Permisos insuficientes |
| **404** | No encontrado - Recurso no existe |
| **422** | Entidad no procesable - Validación de datos fallida |
| **500** | Error del servidor |

En caso de error (422), la respuesta incluye un objeto `errors` con los campos que fallaron en validación.

---

## NOTAS IMPORTANTES

- **IDs:** Numéricos secuenciales
- **Slugs:** Deben ser únicos, en minúsculas, sin acentos (ej: `articulo-importante`)
- **Fechas:** Formato ISO 8601 UTC (ej: `2026-04-20T10:30:00Z`)
- **Paginación:** Default 15 elementos por página
- **Token:** Válido 24 horas. Requiere nuevo login tras expiración
- **CORS:** Habilitado para solicitudes desde frontend
- **Rate Limit:** 60 solicitudes por minuto por IP
- **Content-Type:** Siempre `application/json` excepto en uploads de archivos
- **Validación:** Los campos obligatorios varían por endpoint, se validan server-side

---

## FLUJO TÍPICO DE INTEGRACIÓN

### 1. Autenticación en Frontend
1. Usuario ingresa email y contraseña en un formulario
2. Frontend hace `POST /auth/login` con esas credenciales
3. API devuelve token y datos del usuario
4. Frontend guarda token en localStorage (o cookies)
5. En futuras peticiones, agrega header `Authorization: Bearer {token}`

### 2. Listar Artículos
```
GET /api/articles?page=1&per_page=15
```
Devuelve artículos paginados. Ideal para mostrar en un listado con navegación.

### 3. Crear Artículo (Editor)
```
POST /api/articles
```
Editor auténtico envía título, slug, contenido, sección. Puede guardar como `draft` para editar después.

### 4. Buscar
```
GET /api/search?q=laravel
```
Para una búsqueda sin autenticación que filtre artículos por término.

### 5. Obtener Configuración
```
GET /api/settings
GET /api/homepage
```
Al cargar el sitio, obtén configuración global y de portada (logo, nombre del sitio, artículos destacados, etc.)

---
**Punto clave:** Guardar el token en localStorage después de login y usarlo en toda petición autenticada.
