# SKILL: Dashboard — Barra lateral y permisos por rol

Propósito

- Definir comportamiento y permisos de la barra lateral izquierda del dashboard para los roles `admin` y `author`.
- Servir como especificación de UI/UX y contrato API para implementadores.

Resumen funcional

- Admin: barra izquierda con los apartados "Panel", "Webs", "Usuarios".
  - En "Webs": verá la lista de webs creadas por él y por otros.
  - "Entrar" (acceder al panel de gestión de una web): solo permitido en webs que él ha creado.
  - Editar / Eliminar: el admin puede editar y eliminar webs (acciones disponibles en la lista).
  - Usuarios: el admin puede ver la lista completa de usuarios.

- Author (autor): al entrar al área de autores verá inicialmente "Panel", "Webs", "Configuración".
  - El autor puede crear webs.
  - Cuando el autor entra al panel de una web QUE ÉL HA CREADO, la barra izquierda cambia a:
    - "Ver sitio"
    - "Panel"
    - "Entradas" (hover -> submenú: "Artículos", "Sección", "Noticias")
    - "Medios"
    - "Páginas"
    - "Categorías"
    - "Etiquetas"
    - "Comentarios"
    - "Configuración"
  - Si el autor visualiza webs de otros en la lista, no obtiene el menú completo de gestión para esas webs (solo vista limitada).

Reglas de permiso (resumen)

- `admin`:
  - view_sites_list: sí (todas)
  - enter_site_panel: solo en sites que ha creado
  - edit_site: sí (todas)
  - delete_site: sí (todas)
  - view_users: sí (todas)
- `author`:
  - view_sites_list: sí (preferentemente solo propias; UI puede mostrar solo propias y un listado reducido de públicas)
  - create_site: sí
  - enter_site_panel: solo en sites que ha creado
  - manage_content (artículos, páginas, medios, etc.): solo en sites que ha creado

Notas importantes / aclaraciones

- La especificación sigue tu requerimiento: aunque el admin ve todas las webs, "entrar" al panel de un sitio está limitado a si el admin es creador del mismo; sin embargo el admin puede editar/borrar webs desde la lista. Si prefieres consistencia (p. ej. admin puede entrar a todas), indícalo y lo actualizo.
- "Entrar" = acceso al panel/área de gestión del sitio (no acceso a la vista pública del sitio).

Contractos API sugeridos

- GET /api/sites
  - Query: `?owner={id}` opcional
  - Response: [{ id, title, slug, owner_id, created_at, status }]
- GET /api/sites/{id}
  - Response: { id, title, owner_id, meta... }
- POST /api/sites
  - Body: { title, domain, settings... }
  - Roles: `author`, `admin`
- PUT /api/sites/{id}
  - Body: cambios
  - Permisos: admin (siendo admin puede editar), author solo si owner_id == user.id
- DELETE /api/sites/{id}
  - Permisos: admin (permitido), owner (si policy lo permite)
- GET /api/users
  - Permisos: admin

Componentes de UI recomendados

- `LeftSidebar` (componente reutilizable)
  - Props: `{ role, userId, currentSiteId?, siteOwnerId? }`
  - Lógica: construir items según `role` y `isSiteOwner = (userId === siteOwnerId)`.
- `SitesList` (vista "Webs")
  - Tabla con columnas: Título, Owner, Estado, Acciones (Editar, Eliminar, Entrar)
  - Mostrar acciones según permisos calculados por policy
- `SitePanelLayout` — layout interno de la gestión de una web (usa `LeftSidebar` para el menú del sitio)

Pseudocódigo (decisión del menú)

if role === 'admin' then
menu = ['Panel', 'Webs', 'Usuarios']
if viewingSite and siteOwnerId === userId then
siteMenu = ['Ver sitio','Panel','Entradas','Medios','Páginas','Categorías','Etiquetas','Comentarios','Configuración']
else if role === 'author' then
if viewingSite and siteOwnerId === userId then
menu = ['Ver sitio','Panel','Entradas','Medios','Páginas','Categorías','Etiquetas','Comentarios','Configuración']
else
menu = ['Panel','Webs','Configuración']

Interacción: submenú "Entradas"

- Hover o click en "Entradas" muestra: "Artículos", "Sección", "Noticias"
- Submenú debe ser accesible por teclado y responsive

Criterios de aceptación (QA)

- [ ] Login como admin muestra la barra: Panel, Webs, Usuarios.
- [ ] En Webs el admin ve todas las webs; Acciones Editar/Borrar están visibles; "Entrar" está activo solo en webs que creó.
- [ ] Login como author muestra inicialmente Panel, Webs, Configuración.
- [ ] Author puede crear una web y al entrar a la web creada ve el menú ampliado (incluyendo Entradas con subitems).
- [ ] Hover en "Entradas" muestra exactamente "Artículos", "Sección", "Noticias".
- [ ] Admin puede ver la lista de usuarios en la sección Usuarios.

Testing y accesibilidad

- Añadir tests unitarios para `LeftSidebar` que validen qué items aparecen según diferentes props (role, isSiteOwner).
- Tests E2E: flujos de author crear web -> entrar -> gestionar entradas.
- A11y: submenús navegables por teclado y con roles ARIA apropiados.

Notas adicionales para desarrolladores

- Centralizar la lógica de permisos en policies Laravel (p. ej. `SitePolicy`) y exponer decisiones al frontend vía API (p. ej. `/api/sites/{id}/capabilities`).
- Mantener los strings de menú en una sola fuente (i18n) para evitar inconsistencias.

---

Archivo creado automáticamente como "skill" para que el equipo implemente UI/roles según lo especificado.
