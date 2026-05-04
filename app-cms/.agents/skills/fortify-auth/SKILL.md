---
name: fortify-auth
description: Implementación y guía de Fortify + endpoints API para login y recuperación de contraseña (forgot/reset) en este proyecto.
license: MIT
metadata:
  author: project-maintainer
  version: "1.0"
---

# Fortify — Login y Recuperación de Contraseña (Resumen de implementación)

Propósito

- Documentar cómo está integrado Laravel Fortify en el backend y los endpoints API añadidos para soportar login (API token) y el flujo "olvidé mi contraseña" (forgot/reset) compatible con Fortify.
- Dar instrucciones a otro agente para entender, probar y extender la integración.

Contexto del proyecto

- Estructura: el repositorio contiene `app-cms/backend` (Laravel) y `app-cms/frontend` (Next.js SPA).
- Fortify fue instalado y configurado. Las acciones Fortify se encuentran en `app/Actions/Fortify/` (CreateNewUser, ResetUserPassword, etc.).
- El frontend aún usa autenticación por token (campo `api_token` en `users`), y existen endpoints API en `routes/api.php` para: `/auth/login`, `/auth/logout`, `/auth/me`.

Qué se ha implementado

- Backend (Laravel):
  - Nuevos métodos en `App\Http\Controllers\AuthController`:
    - `forgotPassword(Request $request)` — valida `email` y envía enlace de reseteo usando `Password::sendResetLink()`.
    - `resetPassword(Request $request)` — valida `email`, `token`, `password` y aplica el cambio con `Password::reset()`; además invalida `api_token` y dispara el evento `PasswordReset`.
  - Nuevas rutas API (en `routes/api.php`):
    - `POST /auth/forgot-password` → `AuthController@forgotPassword`
    - `POST /auth/reset-password` → `AuthController@resetPassword`
  - Notas de seguridad: tras reset se invoca `$user->api_token = null` para forzar re-login si se usaban tokens antiguos.

- Frontend (Next.js):
  - `app-cms/frontend/lib/api.ts`: `apiCall` envía `credentials: 'include'` por defecto y se añadió `csrfCookie()` que llama a `/sanctum/csrf-cookie`.
  - `app-cms/frontend/lib/auth.ts`: se añadió `forgotPassword(email)` y `resetPassword(token, email, password, password_confirmation)` que llaman a los nuevos endpoints. `login()` ya llama a `csrfCookie()` antes de autenticar.

  Adición: autenticación por sesión (Sanctum)
  - Se añadieron endpoints web para soportar el flujo SPA basado en sesiones (Sanctum/CSRF):
    - `POST /session/login` → inicia sesión vía `Auth::attempt()` y regenera sesión.
    - `POST /session/logout` → cierra sesión (`Auth::logout()` + invalidate/regenerateToken).
    - `GET /session/me` → devuelve el usuario autenticado por sesión.
    - `POST /register-admin` → crea un usuario, le asigna rol `admin` (si está disponible) y lo loguea en sesión.

  - El frontend ahora intenta primero el flujo por sesión al llamar a `login()` y `getCurrentUser()`. Si no hay sesión disponible, mantiene la compatibilidad con el flujo token-based existente (`api_token`).
  - `app-cms/frontend/app/register/page.tsx` es la nueva página de registro de administrador (estilo "instalación" similar a WordPress): formulario para `Título del sitio`, `Nombre de usuario`, `Contraseña`, `Confirmar contraseña`, `Correo electrónico` y opción de visibilidad. Al enviar llama a `POST /register-admin` y redirige a `/dashboard`.

Nota importante sobre rol por defecto

- El endpoint `POST /register-admin` ahora garantiza que el usuario creado tenga el rol `admin` asignado y persistido. Si Spatie/permission está disponible se invoca `assignRole('admin')`; además, como fallback el controlador persiste el atributo/columna de base de datos (`role = 'admin'` o `is_admin = true`) para evitar que la migración por defecto (`editor`) se aplique accidentalmente. Esto asegura que el flujo de instalación siempre deje un administrador activo.

Requisitos de configuración (backend)

- `config/cors.php` debe contener el origen del frontend y `supports_credentials => true` (ya está configurado con `http://localhost:3000`).
- `config/auth.php` usa `passwords.users.table = password_reset_tokens` — la migración inicial crea esta tabla.
- `config/fortify.php` tiene `'features' => [ Features::resetPasswords(), ... ]`.
- `MAIL_MAILER` durante desarrollo puede ser `log` (así los emails de reset quedan en el log).

Cómo probar

1. Probar "olvidé mi contraseña" desde el frontend (o con curl):

```bash
curl -X POST "http://localhost:8000/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com"}'
```

- Resultado esperado: `{"message":"Enlace de reseteo enviado"}` y en el log/archivo de mails aparecerá el enlace con el `token`.

2. Resetear contraseña (usar token recibido por email/log):

```bash
curl -X POST "http://localhost:8000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","token":"<token>","password":"nueva123","password_confirmation":"nueva123"}'
```

- Resultado esperado: `{"message":"Password actualizado"}`.

3. Login SPA (Next.js) — ya implementado como `POST /api/auth/login` que devuelve `token` y `user`. En el cliente `lib/auth.ts` se guarda `cms_token` y `cms_user` en `localStorage`.

Consideraciones y troubleshooting

- CSRF: Para flujos SPA con cookies es necesario solicitar `/sanctum/csrf-cookie` y usar `credentials: include`. El frontend ahora hace esto antes de `login`, `forgotPassword` y `resetPassword`.
- SameSite / secure cookies: en desarrollo `SESSION_SECURE_COOKIE` debe ser `false` si no se usa HTTPS. `SESSION_DOMAIN` debe permitir el dominio local.
- CORS: `supports_credentials` debe estar activo si el frontend es servido desde otro origen.
- Migraciones: la tabla `password_reset_tokens` se crea en la migración inicial `database/migrations/0001_01_01_000000_create_users_table.php`.
- Emails: con `MAIL_MAILER=log` los enlaces están en `storage/logs/laravel.log`.

Extensiones sugeridas

- Proveer endpoints SPA más integrados: devolver login automático tras reset, o permitir autenticación por sesión usando Fortify + Sanctum en vez de `api_token` si se prefiere sesión.
- Añadir vistas personalizadas Fortify (`Fortify::loginView(...)`) si se quiere usar las vistas Blade.
- Revocar otros tokens/ sesiones tras reset o notificar al usuario por otras vías.

Archivo de referencia (cambios aplicados)

- `app/Http/Controllers/AuthController.php` — métodos `forgotPassword`, `resetPassword`.
- `routes/api.php` — nuevas rutas `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `app/Actions/Fortify/*` — ya presentes (CreateNewUser, ResetUserPassword, ...).
- `frontend/lib/api.ts` — `csrfCookie()` y envío de `credentials: include`.
- `frontend/lib/auth.ts` — `forgotPassword()` y `resetPassword()`.

Protección de rutas y layout

- Se agregó protección client-side en el layout del dashboard: `app/dashboard/layout.tsx` ahora redirige a `/login` cuando `AuthContext` indica que la sesión no existe tras cargar (evita acceso al SPA del dashboard sin autenticación).
- Recomendación: para seguridad más fuerte y protección server-side, migrar a autenticación basada en cookies/Sanctum y comprobar la sesión desde middleware de Next.js o proteger rutas server-side.
- Se añadió centrado permanente para la página de login: `app/login/page.tsx` usa un contenedor con `minHeight: 100vh` y `display:flex` para mantener el formulario siempre centrado en cualquier resolución.

Implementación técnica (client-side)

- Se añadió el componente `components/RequireAuth.tsx` que:
  - Muestra un `CircularProgress` mientras `AuthContext` está cargando.
  - Redirige a `/login?next=<ruta>` cuando `AuthContext` indica que no hay sesión.
  - Renderiza `children` sólo si el usuario está autenticado.

- El `app/dashboard/layout.tsx` fue envuelto con `RequireAuth` para proteger todas las rutas bajo `/dashboard` de forma centralizada (client-side). Esto evita flashes de contenido y asegura que se muestre un spinner hasta que el estado de autenticación esté conocido.

Notas finales

- Hecho: los cambios fueron aplicados y verificados localmente con `pnpm run build`.
- Siguientes pasos sugeridos: aplicar el mismo patrón de redirección para todas las páginas privadas, o migrar a Sanctum/session si prefieres control server-side.

---

Este documento sirve como "skill" para que otro agente entienda el estado actual de la autenticación en el proyecto, cómo probar el flujo de olvido/recuperación de contraseña, y qué piezas pueden necesitar ajustes.
