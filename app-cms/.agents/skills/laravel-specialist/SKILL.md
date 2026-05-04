---
name: laravel-specialist
description: Build and configure Laravel 10+ applications, including creating Eloquent models and relationships, implementing Sanctum authentication, configuring Horizon queues, designing RESTful APIs with API resources, and building reactive interfaces with Livewire. Use when creating Laravel models, setting up queue workers, implementing Sanctum auth flows, building Livewire components, optimising Eloquent queries, or writing Pest/PHPUnit tests for Laravel features.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: backend
  triggers: Laravel, Eloquent, PHP framework, Laravel API, Artisan, Blade templates, Laravel queues, Livewire, Laravel testing, Sanctum, Horizon
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-guardian, test-master, devops-engineer, security-reviewer
---

# Laravel Specialist

Senior Laravel specialist with deep expertise in Laravel 10+, Eloquent ORM, and modern PHP 8.2+ development.

## Core Workflow

1. **Analyse requirements** — Identify models, relationships, APIs, and queue needs
2. **Design architecture** — Plan database schema, service layers, and job queues
3. **Implement models** — Create Eloquent models with relationships, scopes, and casts; run `php artisan make:model` and verify with `php artisan migrate:status`
4. **Build features** — Develop controllers, services, API resources, and jobs; run `php artisan route:list` to verify routing
5. **Test thoroughly** — Write feature and unit tests; run `php artisan test` before considering any step complete (target >85% coverage)

## Reference Guide

Load detailed guidance based on context:

| Topic          | Reference                | Load When                                         |
| -------------- | ------------------------ | ------------------------------------------------- |
| Eloquent ORM   | `references/eloquent.md` | Models, relationships, scopes, query optimization |
| Routing & APIs | `references/routing.md`  | Routes, controllers, middleware, API resources    |
| Queue System   | `references/queues.md`   | Jobs, workers, Horizon, failed jobs, batching     |
| Livewire       | `references/livewire.md` | Components, wire:model, actions, real-time        |
| Testing        | `references/testing.md`  | Feature tests, factories, mocking, Pest PHP       |

## Constraints

### MUST DO

- Use PHP 8.2+ features (readonly, enums, typed properties)
- Type hint all method parameters and return types
- Use Eloquent relationships properly (avoid N+1 with eager loading)
- Implement API resources for transforming data
- Queue long-running tasks
- Write comprehensive tests (>85% coverage)
- Use service containers and dependency injection
- Follow PSR-12 coding standards

### MUST NOT DO

- Use raw queries without protection (SQL injection)
- Skip eager loading (causes N+1 problems)
- Store sensitive data unencrypted
- Mix business logic in controllers
- Hardcode configuration values
- Skip validation on user input
- Use deprecated Laravel features
- Ignore queue failures

## Code Templates

Use these as starting points for every implementation.

### Eloquent Model

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['title', 'body', 'status', 'user_id'];

    protected $casts = [
        'status' => PostStatus::class, // backed enum
        'published_at' => 'immutable_datetime',
    ];

    // Relationships — always eager-load via ::with() at call site
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // Local scope
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PostStatus::Published);
    }
}
```

### Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
```

### API Resource

```php
<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'body'         => $this->body,
            'status'       => $this->status->value,
            'published_at' => $this->published_at?->toIso8601String(),
            'author'       => new UserResource($this->whenLoaded('author')),
            'comments'     => CommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
```

### Queued Job

```php
<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

final class PublishPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        private readonly Post $post,
    ) {}

    public function handle(): void
    {
        $this->post->update([
            'status'       => PostStatus::Published,
            'published_at' => now(),
        ]);
    }

    public function failed(\Throwable $e): void
    {
        // Log or notify — never silently swallow failures
        logger()->error('PublishPost failed', ['post' => $this->post->id, 'error' => $e->getMessage()]);
    }
}
```

### Feature Test (Pest)

```php
<?php

use App\Models\Post;
use App\Models\User;

it('returns a published post for authenticated users', function (): void {
    $user = User::factory()->create();
    $post = Post::factory()->published()->for($user, 'author')->create();

    $response = $this->actingAs($user)
        ->getJson("/api/posts/{$post->id}");

    $response->assertOk()
        ->assertJsonPath('data.status', 'published')
        ->assertJsonPath('data.author.id', $user->id);
});

it('queues a publish job when a draft is submitted', function (): void {
    Queue::fake();
    $user = User::factory()->create();
    $post = Post::factory()->draft()->for($user, 'author')->create();

    $this->actingAs($user)
        ->postJson("/api/posts/{$post->id}/publish")
        ->assertAccepted();

    Queue::assertPushed(PublishPost::class, fn ($job) => $job->post->is($post));
});
```

## Validation Checkpoints

Run these at each workflow stage to confirm correctness before proceeding:

| Stage                | Command                             | Expected Result                      |
| -------------------- | ----------------------------------- | ------------------------------------ |
| After migration      | `php artisan migrate:status`        | All migrations show `Ran`            |
| After routing        | `php artisan route:list --path=api` | New routes appear with correct verbs |
| After job dispatch   | `php artisan queue:work --once`     | Job processes without exception      |
| After implementation | `php artisan test --coverage`       | >85% coverage, 0 failures            |
| Before PR            | `./vendor/bin/pint --test`          | PSR-12 linting passes                |

## Knowledge Reference

Laravel 13+, Eloquent ORM, PHP 8.2+, API resources, Sanctum/Passport, queues, Horizon, Livewire, Inertia, Octane, Pest/PHPUnit, Redis, broadcasting, events/listeners, notifications, task scheduling

[Documentation](https://jeffallan.github.io/claude-skills/skills/backend/laravel-specialist/)

## Gestión de sitios y usuarios (Admin / Autor / Editor)

Esta sección documenta el comportamiento esperado en la interfaz de administración respecto a la gestión de _webs_ (sitios) y usuarios, así como permisos por rol. Añadirla a los `SKILL.md` ayuda a mantener estándares comunes entre equipo backend/frontend.

### Resumen de roles

- **Administrador (admin)**: acceso total. Puede ver/entrar/editar/eliminar cualquier sitio (propio y ajeno). Puede crear, editar y eliminar usuarios y asignarles rol mediante un `select`.
- **Autor (author)**: puede crear sitios y administrar sus propios sitios (ver, entrar, editar, eliminar). En la vista de administración verá un `select` con las webs para ayudar a filtrar, pero las acciones sobre sitios ajenos estarán deshabilitadas según las políticas del backend.
- **Editor (editor)**: no muestra el `select` de filtrado global. Solo podrá ver y entrar en los sitios a los que esté asignado; no podrá editar ni eliminar sitios.

> Nota: las reglas de acceso deben estar aplicadas por políticas/Eloquent policies en backend (p. ej. `SitePolicy::view`, `update`, `delete`) y reforzadas en la API.

### Vista: Webs (Sites)

- En la lista/panel de webs debe mostrarse la siguiente información por sitio:
  - **Título** (string)
  - **Descripción** (string)
  - **Creador** (correo electrónico del usuario que creó la web)
  - **Dominio** (string, opcional)
  - **Opciones / acciones** según rol

- Comportamiento de acciones por rol:
  - **Administrador**: verá las acciones `Ver`, `Entrar`, `Editar`, `Eliminar` para cualquier sitio. `Ver` muestra ficha de información; `Entrar` abre el front del sitio; `Editar` abre el editor/ajustes del sitio; `Eliminar` borra el sitio tras confirmación.
  - **Autor**: verá `Ver` y `Entrar` para todos los sitios listados, pero sólo podrá `Editar` y `Eliminar` los sitios cuya columna `creador` coincida con su correo (o `creator_id`). Para sitios ajenos, los botones de `Editar`/`Eliminar` deben estar ocultos o deshabilitados.
  - **Editor**: verá `Ver` y `Entrar` únicamente para los sitios a los que tenga asignación; los botones `Editar`/`Eliminar` no aparecen.

### Control select / filtrado

- En la vista de administración (panel de webs):
  - **Admin** y **Author** verán un `select` (o combobox) que lista las webs (propias y ajenas) para permitir filtrar la lista y mostrar la ficha informativa en la parte derecha o un panel central. Esto facilita cambiar rápidamente entre sitios.
  - **Editor** no verá este `select` (o estará oculto); su vista es más limitada y depende de las asignaciones que tenga.

### Crear / editar sitio

- Formulario mínimo al crear un sitio:
  - `name` (nombre del sitio) — requerido
  - `description` — requerido
  - `icon` — opcional (imagen, `multipart/form-data` upload)
  - `email` — requerido (correo asociado al sitio)
  - `domain` — opcional (validar formato de dominio)

- Validaciones recomendadas:
  - `name`: string, max 191
  - `description`: string
  - `email`: email válido
  - `icon`: tipo imagen, tamaño razonable (p. ej. < 2MB)
  - `domain`: regexp/validator de hostname

### Vista: Usuarios (admin only)

- En la vista de usuarios mostrar:
  - `name` (nombre de usuario)
  - `email` (correo electrónico)
  - `site` (web a la que pertenece o a la que está asignado)
  - `role` (admin | author | editor | user)

- Permisos:
  - **Administrador**: puede crear usuarios, seleccionando su `role` mediante un `select`; puede editar y eliminar cualquier usuario.
  - **Autor / Editor**: no pueden crear usuarios globalmente desde esta vista; pueden gestionar su propio perfil (nombre, email, password) si corresponde.

### Modelo y migración sugerida (resumen)

- `sites` table (ejemplo):
  - `id` (bigIncrements)
  - `title` (string)
  - `description` (text)
  - `icon_path` (string, nullable)
  - `creator_id` (foreignId -> users.id)
  - `domain` (string, nullable)
  - `created_at`, `updated_at`

- Relaciones Eloquent:
  - `Site::creator()` -> belongsTo(User::class, 'creator_id')
  - `User::sites()` -> hasMany(Site::class, 'creator_id')

### Endpoints/API recomendados

- `GET /api/sites` — lista (admin filtra todo; author devuelve sus sitios y opcionalmente listado completo para el select; editor devuelve sólo asignados)
- `GET /api/sites/{id}` — obtiene ficha del sitio
- `POST /api/sites` — crea sitio (admin/author)
- `PUT /api/sites/{id}` — actualiza (policy en backend)
- `DELETE /api/sites/{id}` — elimina (policy en backend)
- `GET /api/users` — lista usuarios (admin)
- `POST /api/users` — crear usuario (admin)
- `PUT /api/users/{id}` — editar usuario (admin)
- `DELETE /api/users/{id}` — eliminar usuario (admin)

### Notas de implementación

- Aplicar `Policy` por modelo (`SitePolicy`, `UserPolicy`) y registrar en `AuthServiceProvider`.
- Usar Spatie Roles & Permissions o gates para comprobar `hasRole('admin')` en acciones sensibles.
- En el frontend, **mostrar u ocultar** controles según el rol y deshabilitar acciones no permitidas; no confiar sólo en ocultar UI — el backend debe validar y negar operaciones no autorizadas.
- Para la lista/`select` de webs, proporcionar una API que devuelva { id, title, creator_email, domain } para poblar el combobox sin exponer datos sensibles.

Esta especificación debe añadirse a los `SKILL.md` correspondientes (backend/frontend) para que los desarrolladores conozcan el contrato de la UI y las reglas de autorización.
