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

## Site and User Management (Admin / Author / Editor)

This section documents the expected admin UI behavior for managing sites and users, and the permissions model by role. Add this content to the relevant `SKILL.md` files (backend/frontend) to keep shared standards across teams.

### Roles summary

- **Administrator (admin)**: full access. Can view/enter/edit/delete any site (own and others). Can create, edit and delete users and assign roles via a `select`.
- **Author (author)**: can create sites and manage their own sites (view, enter, edit, delete). In the admin view they see a `select` with sites to help filter, but actions on other users' sites are disabled according to backend policies.
- **Editor (editor)**: does not see the global filter `select`. Can only view and enter sites they are assigned to; cannot edit or delete sites.

> Note: access rules must be enforced by backend policies/Eloquent policies (e.g. `SitePolicy::view`, `update`, `delete`) and reinforced in the API.

### Sites list (Admin panel)

- The sites list/panel should show the following per-site:
    - **Title** (string)
    - **Description** (string)
    - **Creator** (email of the user who created the site)
    - **Domain** (string, optional)
    - **Options / actions** depending on role

- Role-based action behavior:
    - **Administrator**: sees actions `View`, `Enter`, `Edit`, `Delete` for any site. `View` shows an info card; `Enter` opens the site frontend; `Edit` opens the editor/settings; `Delete` removes the site after confirmation.
    - **Author**: sees `View` and `Enter` for all listed sites, but can only `Edit` and `Delete` sites whose `creator` column matches their email (or `creator_id`). For other sites the `Edit`/`Delete` buttons should be hidden or disabled.
    - **Editor**: sees `View` and `Enter` only for assigned sites; `Edit`/`Delete` actions are not shown.

### Filter / select control

- In the admin view (sites panel):
    - **Admin** and **Author** see a `select` (or combobox) listing sites (own and others) to filter the list and show the info card on the right or in a central panel. This allows quickly switching between sites.
    - **Editor** does not see the `select` (or it is hidden); their view is limited to assigned sites.

### Create / edit site

- Minimum create form:
    - `name` — required
    - `description` — required
    - `icon` — optional (image, `multipart/form-data` upload)
    - `email` — required (email associated with the site)
    - `domain` — optional (validate hostname format)

- Recommended validations:
    - `name`: string, max 191
    - `description`: string
    - `email`: valid email
    - `icon`: image type, reasonable size (e.g. < 2MB)
    - `domain`: hostname regex/validator

### Users view (admin only)

- The users list should show:
    - `name` (username)
    - `email`
    - `site` (site they belong to or are assigned to)
    - `role` (admin | author | editor | user)

- Permissions:
    - **Administrator**: can create users, choosing their `role` via a `select`; can edit and delete any user.
    - **Author / Editor**: cannot create global users from this view; may manage their own profile (name, email, password) if applicable.

### Suggested model and migration (summary)

- `sites` table (example):
    - `id` (bigIncrements)
    - `title` (string)
    - `description` (text)
    - `icon_path` (string, nullable)
    - `creator_id` (foreignId -> users.id)
    - `domain` (string, nullable)
    - `created_at`, `updated_at`

- Eloquent relations:
    - `Site::creator()` -> belongsTo(User::class, 'creator_id')
    - `User::sites()` -> hasMany(Site::class, 'creator_id')

### Recommended Endpoints / API

- `GET /api/sites` — list (admin sees all; author returns their sites and optionally the full list for the select; editor returns only assigned sites)
- `GET /api/sites/{id}` — fetch site details
- `POST /api/sites` — create site (admin/author)
- `PUT /api/sites/{id}` — update (backend policy enforced)
- `DELETE /api/sites/{id}` — delete (backend policy enforced)
- `GET /api/users` — list users (admin)
- `POST /api/users` — create user (admin)
- `PUT /api/users/{id}` — edit user (admin)
- `DELETE /api/users/{id}` — delete user (admin)

### Implementation notes

- Apply `Policy` per model (`SitePolicy`, `UserPolicy`) and register them in `AuthServiceProvider`.
- Use Spatie Roles & Permissions or gates to check `hasRole('admin')` for sensitive actions.
- In the frontend, show/hide controls based on role and disable actions that are not permitted; do not rely only on hiding UI — the backend must validate and reject unauthorized operations.
- For the sites `select`, provide an API that returns `{ id, title, creator_email, domain }` to populate the combobox without exposing sensitive data.

This specification should be added to the corresponding `SKILL.md` files (backend/frontend) so developers understand the UI contract and authorization rules.
