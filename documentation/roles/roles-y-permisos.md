# Roles y Permisos

El CMS cuenta con 4 roles principales, cada uno con responsabilidades y permisos específicos para garantizar una gestión eficiente y segura del contenido.

---

## AUTOR

**Responsabilidad:** Crear contenido y publicarlo directamente sin necesidad de aprobación.

**Objetivo:** Velocidad y autonomía

### Permisos
- Crear artículos nuevos
- Editar sus propios artículos (borradores y publicados)
- Publicar artículos directamente
- Crear y asignar etiquetas
- Subir archivos multimedia
- Ver estadísticas de sus artículos
- Acceder a su perfil

### Restricciones
- No puede editar artículos de otros autores
- No puede eliminar artículos
- No puede acceder a usuarios ni configuración del sistema
- No puede moderar comentarios (si existen)

---

## EDITOR

**Responsabilidad:** Revisar, corregir y garantizar la calidad del contenido publicado.

**Objetivo:** Calidad y coherencia del sitio

### Permisos
- Visualizar todos los artículos (borradores y publicados)
- Editar cualquier artículo
- Publicar artículos
- Despublicar artículos si algo está mal
- Crear y editar etiquetas
- Crear y editar secciones
- Subir y gestionar archivos multimedia
- Ver estadísticas de todos los artículos
- Moderar comentarios (si existen)

### Restricciones
- No puede crear artículos nuevos desde cero
- No puede eliminar artículos
- No puede gestionar usuarios
- No puede acceder a configuración del sistema

---

## ADMIN

**Responsabilidad:** Control total del sistema y gestión administrativa.

### Permisos
- CRUD completo de todos los recursos (artículos, secciones, etiquetas, banners)
- Gestión de usuarios (crear, editar, eliminar, asignar roles)
- Acceso a configuración del sistema
- Acceso a configuración de portada
- Ver logs del sistema (si existen)
- Subir y eliminar archivos multimedia
- Gestionar contactos y mensajes
- Acceso a todas las estadísticas
- Moderar comentarios

### Restricciones
- Ninguna (acceso completo)

---

## USUARIO

**Responsabilidad:** Interacción básica con el contenido público.

**Nota:** Este rol es principalmente para visitantes del frontend (si el sistema lo requiere).

### Permisos
- Ver artículos publicados
- Buscar artículos
- Dejar comentarios (si la funcionalidad está habilitada)
- Enviar mensajes de contacto
- Acceder a su perfil de usuario

### Restricciones
- No puede crear ni editar contenido
- No puede publicar ni despublicar
- No puede acceder a funcionalidades administrativas

---

## Matriz de Permisos

| Funcionalidad | Autor | Editor | Admin | Usuario |
|---|:---:|:---:|:---:|:---:|
| **ARTÍCULOS** | | | | |
| Crear artículos | ✓ | ✗ | ✓ | ✗ |
| Editar propios artículos | ✓ | - | ✓ | ✗ |
| Editar cualquier artículo | ✗ | ✓ | ✓ | ✗ |
| Publicar | ✓ | ✓ | ✓ | ✗ |
| Despublicar | ✗ | ✓ | ✓ | ✗ |
| Eliminar | ✗ | ✗ | ✓ | ✗ |
| Ver estadísticas | ✓ (propias) | ✓ (todas) | ✓ (todas) | ✗ |
| **SECCIONES Y ETIQUETAS** | | | | |
| Crear | ✗ | ✓ | ✓ | ✗ |
| Editar | ✗ | ✓ | ✓ | ✗ |
| Eliminar | ✗ | ✗ | ✓ | ✗ |
| **MULTIMEDIA** | | | | |
| Subir archivos | ✓ | ✓ | ✓ | ✗ |
| Eliminar archivos | ✗ | ✓ | ✓ | ✗ |
| **USUARIOS** | | | | |
| Gestionar usuarios | ✗ | ✗ | ✓ | ✗ |
| Asignar roles | ✗ | ✗ | ✓ | ✗ |
| **CONFIGURACIÓN** | | | | |
| Acceder a settings | ✗ | ✗ | ✓ | ✗ |
| Configurar portada | ✗ | ✗ | ✓ | ✗ |
| **COMENTARIOS** | | | | |
| Dejar comentarios | ✗ | ✗ | ✗ | ✓ |
| Moderar comentarios | ✗ | ✓ | ✓ | ✗ |
| **CONTACTO** | | | | |
| Enviar mensaje | ✗ | ✗ | ✗ | ✓ |
| Ver mensajes | ✗ | ✗ | ✓ | ✗ |

---

## Flujo de Publicación Recomendado

1. **Autor** crea un artículo y lo publica directamente (objetivo: velocidad)
2. **Editor** revisa el contenido publicado periódicamente
3. Si hay errores, **Editor** edita y republicar
4. Si algo está muy mal, **Editor** despublica hasta corregir
5. **Admin** supervisa y tiene control total si es necesario

Este flujo garantiza: Velocidad en publicación + Calidad editorial + Control administrativo.