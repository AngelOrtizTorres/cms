---
name: fortify-auth
description: Implementation and guide for Fortify + API endpoints for login and password recovery (forgot/reset) in this project.
license: MIT
metadata:
  author: project-maintainer
  version: "1.0"
---

## Fortify — Login and Password Recovery (Implementation Summary)

Purpose

- Document how Laravel Fortify is integrated in the backend and which API endpoints were added to support login (API token) and the "forgot/reset password" flow compatible with Fortify.
- Provide instructions for another agent to understand, test, and extend the integration.

Project context

- Structure: the repository contains `app-cms/backend` (Laravel) and `app-cms/frontend` (Next.js SPA).
- Fortify is installed and configured. Fortify actions live in `app/Actions/Fortify/` (CreateNewUser, ResetUserPassword, etc.).
- The frontend still supports token-based auth (the `api_token` field on `users`), and API routes exist in `routes/api.php` for: `/auth/login`, `/auth/logout`, `/auth/me`.

What was implemented

- Backend (Laravel):
  - New methods in `App\Http\Controllers\AuthController`:
    - `forgotPassword(Request $request)` — validates `email` and sends a reset link using `Password::sendResetLink()`.
    - `resetPassword(Request $request)` — validates `email`, `token`, `password` and applies the change with `Password::reset()`; also invalidates `api_token` and fires the `PasswordReset` event.
  - New API routes (in `routes/api.php`):
    - `POST /auth/forgot-password` → `AuthController@forgotPassword`
    - `POST /auth/reset-password` → `AuthController@resetPassword`
  - Security note: after a reset the code sets `$user->api_token = null` to force re-login if old tokens were in use.

- Frontend (Next.js):
  - `app-cms/frontend/lib/api.ts`: `apiCall` sends `credentials: 'include'` by default and a `csrfCookie()` helper was added that calls `/sanctum/csrf-cookie`.
  - `app-cms/frontend/lib/auth.ts`: added `forgotPassword(email)` and `resetPassword(token, email, password, password_confirmation)` which call the new endpoints. `login()` already calls `csrfCookie()` before authenticating.

  Session-based authentication (Sanctum)
  - Web endpoints were added to support SPA flows based on sessions (Sanctum/CSRF):
    - `POST /session/login` → logs in via `Auth::attempt()` and regenerates the session.
    - `POST /session/logout` → logs out (`Auth::logout()` + invalidate/regenerateToken).
    - `GET /session/me` → returns the authenticated session user.
    - `POST /register-admin` → creates a user, assigns the `admin` role (if available) and logs them in to the session.

  - The frontend now attempts session-based flow first when calling `login()` and `getCurrentUser()`. If no session is available, it falls back to the existing token-based flow (`api_token`).
  - `app-cms/frontend/app/register/page.tsx` is the new admin registration page (installation-style similar to WordPress): form fields include `Site title`, `Username`, `Password`, `Confirm password`, `Email` and visibility option. On submit it calls `POST /register-admin` and redirects to `/dashboard`.

Important note about default role

- The `POST /register-admin` endpoint now ensures the created user has the `admin` role assigned and persisted. If Spatie/permission is available it calls `assignRole('admin')`; as a fallback the controller persists a database attribute/column (`role = 'admin'` or `is_admin = true`) to avoid the default migration (e.g. `editor`) being applied accidentally. This ensures the installation flow always leaves an active administrator.

Backend configuration requirements

- `config/cors.php` must include the frontend origin and `supports_credentials => true` (currently configured with `http://localhost:3000`).
- `config/auth.php` uses `passwords.users.table = password_reset_tokens` — the initial migration creates this table.
- `config/fortify.php` must include `'features' => [ Features::resetPasswords(), ... ]`.
- During development `MAIL_MAILER` can be set to `log` (so reset emails appear in logs).

How to test

1. Test the "forgot my password" flow from the frontend.

- Expected result: `{"message":"Reset link sent"}` and the reset link with the `token` will appear in logs/mail output.

2. Reset the password (use the token received via email/log).

- Expected result: `{"message":"Password updated"}`.

3. SPA login (Next.js) — implemented as `POST /api/auth/login` that returns `token` and `user`. On the client `lib/auth.ts` stores `cms_token` and `cms_user` in `localStorage`.

Considerations and troubleshooting

- CSRF: For SPA cookie flows you must request `/sanctum/csrf-cookie` and use `credentials: include`. The frontend now does this before `login`, `forgotPassword`, and `resetPassword`.
- SameSite / secure cookies: in development `SESSION_SECURE_COOKIE` should be `false` if not using HTTPS. `SESSION_DOMAIN` must allow the local domain.
- CORS: `supports_credentials` must be enabled if the frontend is served from another origin.
- Migrations: the `password_reset_tokens` table is created by the initial migration `database/migrations/0001_01_01_000000_create_users_table.php`.
- Emails: with `MAIL_MAILER=log` the links will appear in `storage/logs/laravel.log`.

Suggested extensions

- Provide more integrated SPA endpoints: automatically log in after reset, or prefer session-based authentication using Fortify + Sanctum instead of `api_token` if you prefer sessions.
- Add custom Fortify views (`Fortify::loginView(...)`) if you want to use Blade views.
- Revoke other tokens/sessions after reset or notify the user through other channels.

Reference files (changes applied)

- `app/Http/Controllers/AuthController.php` — `forgotPassword` and `resetPassword` methods.
- `routes/api.php` — new routes `POST /auth/forgot-password`, `POST /auth/reset-password`.
- `app/Actions/Fortify/*` — already present (CreateNewUser, ResetUserPassword, ...).
- `frontend/lib/api.ts` — `csrfCookie()` and sending `credentials: include`.
- `frontend/lib/auth.ts` — `forgotPassword()` and `resetPassword()`.

Route protection and layout

- Client-side protection was added in the dashboard layout: `app/dashboard/layout.tsx` now redirects to `/login` when `AuthContext` indicates no session after load (prevents access to the dashboard SPA without authentication).
- Recommendation: for stronger security and server-side protection, migrate to cookie-based/Sanctum auth and verify the session from Next.js middleware or protect routes server-side.
- The login page has permanent centering: `app/login/page.tsx` uses a container with `minHeight: 100vh` and `display:flex` to keep the form centered at all viewport sizes.

Technical implementation (client-side)

- A `components/RequireAuth.tsx` component was added that:
  - Shows a `CircularProgress` while `AuthContext` is loading.
  - Redirects to `/login?next=<route>` when `AuthContext` indicates no session.
  - Renders `children` only if the user is authenticated.

- `app/dashboard/layout.tsx` was wrapped with `RequireAuth` to protect all routes under `/dashboard` centrally (client-side). This avoids content flashes and shows a spinner until auth state is known.

Final notes

- Done: changes were applied and verified locally with `pnpm run build`.
- Suggested next steps: apply the same redirect pattern to all private pages, or migrate to Sanctum/session for stronger server-side control.

---

This document serves as a "skill" so another agent can understand the current authentication state in the project, how to test the forgot/reset password flow, and which pieces may need adjustments.
