<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SiteController extends Controller
{
    protected string $filePath;

    public function __construct()
    {
        $this->filePath = storage_path('app/sites.json');
        if (!file_exists($this->filePath)) {
            $sample = [
                [
                    'id' => 1,
                    'title' => 'Mi Sitio Principal',
                    'slug' => 'mi-sitio-principal',
                    'owner_id' => 1,
                    'domain' => 'example.com',
                    'description' => 'Site principal de ejemplo',
                    'contact_email' => 'admin@example.com',
                    'icon' => null,
                    'status' => 'active',
                    'created_at' => now()->toDateTimeString(),
                ],
                [
                    'id' => 2,
                    'title' => 'Blog secundario',
                    'slug' => 'blog-secundario',
                    'owner_id' => 2,
                    'domain' => 'blog.local',
                    'description' => 'Blog de pruebas',
                    'contact_email' => 'author@example.com',
                    'icon' => null,
                    'status' => 'active',
                    'created_at' => now()->toDateTimeString(),
                ],
            ];
            @file_put_contents($this->filePath, json_encode($sample, JSON_PRETTY_PRINT));
        }
    }

    protected function readSites(): array
    {
        $json = @file_get_contents($this->filePath);
        $arr = json_decode($json, true) ?? [];
        return $arr;
    }

    protected function saveSites(array $sites): void
    {
        @file_put_contents($this->filePath, json_encode($sites, JSON_PRETTY_PRINT));
    }

    protected function resolveAuthUser(Request $request): ?User
    {
        $token = $request->bearerToken();
        if ($token) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                return $tokenUser;
            }
        }

        return $request->user() ?? Auth::user();
    }

    protected function findSiteRecord($id): ?array
    {
        $sites = $this->readSites();
        foreach ($sites as $s) {
            if ((is_numeric($id) && $s['id'] == (int) $id) || (!is_numeric($id) && isset($s['slug']) && $s['slug'] === $id)) {
                return $s;
            }
        }
        return null;
    }

    protected function canManageEditors(User $user, array $site): bool
    {
        $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
        return $role === 'admin' || ((int) ($site['owner_id'] ?? 0) === (int) $user->id);
    }

    protected function ensureSiteDatabaseRecord(array $site): int
    {
        $siteId = (int) ($site['id'] ?? 0);
        if ($siteId <= 0) {
            $siteId = ((int) DB::table('sites')->max('id')) + 1;
        }

        $title = (string) ($site['title'] ?? ('Site ' . $siteId));
        $slug = (string) ($site['slug'] ?? Str::slug($title));
        $status = (string) ($site['status'] ?? 'active');
        if (!in_array($status, ['active', 'inactive', 'archived'], true)) {
            $status = 'active';
        }

        $exists = DB::table('sites')->where('id', $siteId)->exists();
        if (!$exists) {
            $now = now()->toDateTimeString();
            DB::table('sites')->insert([
                'id' => $siteId,
                'title' => $title,
                'slug' => $slug,
                'owner_id' => isset($site['owner_id']) ? (int) $site['owner_id'] : null,
                'domain' => $site['domain'] ?? null,
                'description' => $site['description'] ?? null,
                'contact_email' => $site['contact_email'] ?? null,
                'icon' => $site['icon'] ?? null,
                'status' => $status,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        return $siteId;
    }

    public function index(Request $request)
    {
        $sites = $this->readSites();
        $owner = $request->query('owner');
        if ($owner) {
            $sites = array_values(array_filter($sites, fn($s) => $s['owner_id'] == (int) $owner));
        }

        $ownerIds = array_values(array_unique(array_filter(array_map(
            fn($s) => isset($s['owner_id']) ? (int) $s['owner_id'] : null,
            $sites
        ))));
        $usersById = User::whereIn('id', $ownerIds)->get(['id', 'email'])->keyBy('id');

        // Add creator email for convenience in frontend
        $sites = array_map(function ($s) use ($usersById) {
            $ownerId = isset($s['owner_id']) ? (int) $s['owner_id'] : 0;
            $creator = $usersById->get($ownerId);
            $s['creator_email'] = $creator?->email ?? null;
            return $s;
        }, $sites);

        return response()->json($sites);
    }

    public function show($id)
    {
        $sites = $this->readSites();
        foreach ($sites as $s) {
            if ((is_numeric($id) && $s['id'] == (int) $id) || (!is_numeric($id) && isset($s['slug']) && $s['slug'] === $id)) {
                $creator = User::find($s['owner_id']);
                $s['creator_email'] = $creator?->email ?? null;
                return response()->json($s);
            }
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        // Permitir autenticación por bearer token o por sesión (Sanctum)
        $token = $request->bearerToken();
        $user = null;
        if ($token) {
            $user = User::where('api_token', $token)->first();
        }
        if (!$user) {
            $user = $request->user() ?? Auth::user();
        }
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
        if (!in_array($role, ['admin', 'author'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'email' => 'required|email',
            'domain' => 'nullable|string',
            'icon' => 'nullable|file|image|max:2048',
        ]);

        $sites = $this->readSites();
        $newId = $sites ? (max(array_column($sites, 'id')) + 1) : 1;
        $slug = Str::slug($data['title']);
        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('sites/icons');
        }

        $site = [
            'id' => $newId,
            'title' => $data['title'],
            'slug' => $slug,
            'owner_id' => $user->id,
            'domain' => $data['domain'] ?? null,
            'description' => $data['description'] ?? null,
            'contact_email' => $data['email'] ?? null,
            'icon' => $iconPath,
            'status' => 'active',
            'created_at' => now()->toDateTimeString(),
        ];

        $sites[] = $site;
        $this->saveSites($sites);

        return response()->json($site, 201);
    }

    public function update(Request $request, $id)
    {
        $token = $request->bearerToken();
        $user = null;
        if ($token) {
            $user = User::where('api_token', $token)->first();
        }
        if (!$user) {
            $user = $request->user() ?? Auth::user();
        }
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $sites = $this->readSites();
        foreach ($sites as $idx => $s) {
            if ((is_numeric($id) && $s['id'] == (int) $id) || (!is_numeric($id) && isset($s['slug']) && $s['slug'] === $id)) {
                $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
                $isOwner = $s['owner_id'] == $user->id;
                if ($role !== 'admin' && !$isOwner) {
                    return response()->json(['message' => 'No autorizado'], 403);
                }

                $data = $request->only(['title', 'domain', 'status', 'description', 'email']);
                if ($request->hasFile('icon')) {
                    $iconPath = $request->file('icon')->store('sites/icons');
                    $s['icon'] = $iconPath;
                }
                if (isset($data['title'])) {
                    $s['title'] = $data['title'];
                    $s['slug'] = Str::slug($data['title']);
                }
                if (isset($data['domain'])) {
                    $s['domain'] = $data['domain'];
                }
                if (isset($data['description'])) {
                    $s['description'] = $data['description'];
                }
                if (isset($data['email'])) {
                    $s['contact_email'] = $data['email'];
                }
                if (isset($data['status'])) {
                    $s['status'] = $data['status'];
                }
                $s['updated_at'] = now()->toDateTimeString();
                $sites[$idx] = $s;
                $this->saveSites($sites);
                return response()->json($s);
            }
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    public function destroy(Request $request, $id)
    {
        $token = $request->bearerToken();
        $user = null;
        if ($token) {
            $user = User::where('api_token', $token)->first();
        }
        if (!$user) {
            $user = $request->user() ?? Auth::user();
        }
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $sites = $this->readSites();
        foreach ($sites as $idx => $s) {
            if ((is_numeric($id) && $s['id'] == (int) $id) || (!is_numeric($id) && isset($s['slug']) && $s['slug'] === $id)) {
                $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
                $isOwner = $s['owner_id'] == $user->id;
                if ($role !== 'admin' && !$isOwner) {
                    return response()->json(['message' => 'No autorizado'], 403);
                }
                array_splice($sites, $idx, 1);
                $this->saveSites($sites);
                return response()->json(['message' => 'Deleted']);
            }
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    public function editors(Request $request, $id)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $site = $this->findSiteRecord($id);
        if (!$site) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if (!$this->canManageEditors($user, $site)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $dbSiteId = $this->ensureSiteDatabaseRecord($site);

        $rows = DB::table('site_user')
            ->join('users', 'users.id', '=', 'site_user.user_id')
            ->where('site_user.site_id', $dbSiteId)
            ->select('users.id', 'users.name', 'users.email', 'site_user.role')
            ->orderBy('users.name')
            ->get();

        return response()->json($rows);
    }

    public function assignEditor(Request $request, $id)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $site = $this->findSiteRecord($id);
        if (!$site) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if (!$this->canManageEditors($user, $site)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $dbSiteId = $this->ensureSiteDatabaseRecord($site);

        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'nullable|string|max:50',
        ]);

        DB::table('site_user')->updateOrInsert(
            ['site_id' => $dbSiteId, 'user_id' => (int) $data['user_id']],
            ['role' => $data['role'] ?? 'editor']
        );

        return response()->json(['message' => 'Editor asignado']);
    }

    public function removeEditor(Request $request, $id, $userId)
    {
        $user = $this->resolveAuthUser($request);
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $site = $this->findSiteRecord($id);
        if (!$site) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if (!$this->canManageEditors($user, $site)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $dbSiteId = $this->ensureSiteDatabaseRecord($site);

        DB::table('site_user')
            ->where('site_id', $dbSiteId)
            ->where('user_id', (int) $userId)
            ->delete();

        return response()->json(['message' => 'Editor eliminado']);
    }

    public function capabilities(Request $request, $id)
    {
        $token = $request->bearerToken();
        $user = null;
        if ($token) {
            $user = User::where('api_token', $token)->first();
        }
        if (!$user) {
            $user = $request->user() ?? Auth::user();
        }
        $sites = $this->readSites();
        $site = null;
        foreach ($sites as $s) {
            if ((is_numeric($id) && $s['id'] == (int) $id) || (!is_numeric($id) && isset($s['slug']) && $s['slug'] === $id)) {
                $site = $s;
                break;
            }
        }
        if (!$site) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $role = $user ? ($user->getRoleNames()->first() ?? ($user->role ?? 'user')) : 'guest';
        $isOwner = $user ? ($site['owner_id'] == $user->id) : false;

        $caps = [
            'view_site' => true,
            'enter_site_panel' => $isOwner,
            'edit_site' => ($role === 'admin') || $isOwner,
            'delete_site' => ($role === 'admin') || $isOwner,
            'create_site' => in_array($role, ['admin', 'author']),
            'manage_content' => $isOwner,
        ];

        return response()->json($caps);
    }
}
