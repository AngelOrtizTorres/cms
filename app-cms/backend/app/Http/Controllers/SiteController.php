<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\User;

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
                    'status' => 'active',
                    'created_at' => now()->toDateTimeString(),
                ],
                [
                    'id' => 2,
                    'title' => 'Blog secundario',
                    'slug' => 'blog-secundario',
                    'owner_id' => 2,
                    'domain' => 'blog.local',
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

    public function index(Request $request)
    {
        $sites = $this->readSites();
        $owner = $request->query('owner');
        if ($owner) {
            $sites = array_values(array_filter($sites, fn($s) => $s['owner_id'] == (int) $owner));
        }
        return response()->json($sites);
    }

    public function show($id)
    {
        $sites = $this->readSites();
        foreach ($sites as $s) {
            if ($s['id'] == (int) $id) {
                return response()->json($s);
            }
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    public function store(Request $request)
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', $token)->first() : null;
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
        if (!in_array($role, ['admin', 'author'])) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'title' => 'required|string',
            'domain' => 'nullable|string',
        ]);

        $sites = $this->readSites();
        $newId = $sites ? (max(array_column($sites, 'id')) + 1) : 1;
        $slug = Str::slug($data['title']);
        $site = [
            'id' => $newId,
            'title' => $data['title'],
            'slug' => $slug,
            'owner_id' => $user->id,
            'domain' => $data['domain'] ?? null,
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
        $user = $token ? User::where('api_token', $token)->first() : null;
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $sites = $this->readSites();
        foreach ($sites as $idx => $s) {
            if ($s['id'] == (int) $id) {
                $role = $user->getRoleNames()->first() ?? ($user->role ?? 'user');
                $isOwner = $s['owner_id'] == $user->id;
                if ($role !== 'admin' && !$isOwner) {
                    return response()->json(['message' => 'No autorizado'], 403);
                }

                $data = $request->only(['title', 'domain', 'status']);
                if (isset($data['title'])) {
                    $s['title'] = $data['title'];
                    $s['slug'] = Str::slug($data['title']);
                }
                if (isset($data['domain'])) {
                    $s['domain'] = $data['domain'];
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
        $user = $token ? User::where('api_token', $token)->first() : null;
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $sites = $this->readSites();
        foreach ($sites as $idx => $s) {
            if ($s['id'] == (int) $id) {
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

    public function capabilities(Request $request, $id)
    {
        $token = $request->bearerToken();
        $user = $token ? User::where('api_token', $token)->first() : null;
        $sites = $this->readSites();
        $site = null;
        foreach ($sites as $s) {
            if ($s['id'] == (int) $id) {
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
