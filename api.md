LARAVEL (API REST)

propone información de noticias a las secciones

recibe peticiones, consulta la base de datos y devuelve en formato JSON.

Ejemplo: React pide las ultimas noticias -> la API consulta la BD -> devuelve JSON con esas noticias

GET    /api/articles
> devuelve lista paginada de artículos publicados
 
GET    /api/articles/{slug}
> devuelve un artículo concreto por su slug
 
GET    /api/articles/featured
> devuelve los artículos marcados como destacados para portada
 
POST   /api/articles
> crea un artículo nuevo
 
PUT    /api/articles/{id}
> edita un artículo existente
 
DELETE /api/articles/{id}
> borra un artículo
 
GET    /api/sections
> devuelve todas las secciones disponibles
 
GET    /api/sections/{slug}
> devuelve los artículos que pertenecen a una sección concreta
 
POST   /api/sections
> crea una sección nueva
 
PUT    /api/sections/{id}
> edita una sección existente
 
DELETE /api/sections/{id}
> borra una sección
 
GET    /api/tags
> devuelve todas las etiquetas
 
GET    /api/tags/{slug}
> devuelve los artículos que tienen una etiqueta concreta
 
POST   /api/tags
> crea una etiqueta nueva
 
PUT    /api/tags/{id}
> edita una etiqueta existente
 
DELETE /api/tags/{id}
> borra una etiqueta
 
GET    /api/banners
> devuelve todos los banners activos
 
GET    /api/banners/{posicion}
> devuelve los banners de una posición concreta (cabecera, sidebar, entre_noticias)
 
POST   /api/banners
> crea un banner nuevo
 
PUT    /api/banners/{id}
> edita un banner existente
 
DELETE /api/banners/{id}
> borra un banner
 
GET    /api/homepage
> devuelve la configuración actual de la portada
 
PUT    /api/homepage
> actualiza la configuración de la portada
 
GET    /api/settings
> devuelve la configuración general del sitio
 
PUT    /api/settings
> actualiza la configuración general del sitio
 
GET    /api/notices
> devuelve los avisos activos
 
POST   /api/notices
> crea un aviso nuevo
 
PUT    /api/notices/{id}
> edita un aviso existente
 
DELETE /api/notices/{id}
> borra un aviso
 
POST   /api/contact
> recibe el formulario de contacto del frontend
 
GET    /api/contact/messages
> devuelve los mensajes de contacto recibidos
 
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
 