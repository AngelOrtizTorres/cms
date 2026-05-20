<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
    protected function resolveSiteId($siteId): ?int
    {
        if (is_numeric($siteId)) {
            return (int) $siteId;
        }

        try {
            $row = DB::table('sites')->where('slug', $siteId)->first();
            if ($row && isset($row->id)) {
                return (int) $row->id;
            }
        } catch (\Exception $e) {
        }

        $path = storage_path('app/sites.json');
        if (file_exists($path)) {
            $json = @file_get_contents($path);
            $arr = json_decode($json, true) ?? [];
            foreach ($arr as $s) {
                if (isset($s['slug']) && $s['slug'] === $siteId && isset($s['id'])) {
                    return (int) $s['id'];
                }
            }
        }

        return null;
    }

    protected function siteOwnerId(int $siteId): ?int
    {
        try {
            $site = Site::find($siteId);
            if ($site && isset($site->owner_id)) {
                return (int) $site->owner_id;
            }
        } catch (\Exception $e) {
        }

        $path = storage_path('app/sites.json');
        if (file_exists($path)) {
            $json = @file_get_contents($path);
            $arr = json_decode($json, true) ?? [];
            foreach ($arr as $s) {
                if (isset($s['id']) && (int) $s['id'] === $siteId && isset($s['owner_id'])) {
                    return (int) $s['owner_id'];
                }
            }
        }

        return null;
    }

    protected function canManageSiteNews(User $user, int $siteId): bool
    {
        if (($user->role ?? null) === 'admin') {
            return true;
        }

        $ownerId = $this->siteOwnerId($siteId);
        if ($ownerId && (int) $user->id === $ownerId) {
            return true;
        }

        return DB::table('site_user')
            ->where('site_id', $siteId)
            ->where('user_id', $user->id)
            ->exists();
    }

    protected function canReorderSiteNews(User $user, int $siteId): bool
    {
        $ownerId = $this->siteOwnerId($siteId);
        return ($user->role ?? null) === 'author' && $ownerId !== null && (int) $user->id === $ownerId;
    }

    public function index(Request $request)
    {
        $query = News::with(['primarySection', 'sections']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $list = $query->orderBy('published_at', 'desc')->get();
        return response()->json($list);
    }

    public function siteIndex($siteId, Request $request)
    {
        $resolved = $this->resolveSiteId($siteId);
        $query = $resolved
            ? News::with(['primarySection', 'sections'])->where('site_id', $resolved)
            : News::with(['primarySection', 'sections'])->query();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $list = $query->orderBy('published_at', 'desc')->get();
        return response()->json($list);
    }

    public function show($id)
    {
        $news = News::with(['primarySection', 'sections'])->findOrFail($id);
        return response()->json($news);
    }

    protected function tryTokenAuth(Request $request)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_id' => 'nullable|exists:sites,id',
            'primary_section_id' => 'nullable|exists:sections,id',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:news',
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'integer|exists:sections,id',
        ]);

        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!empty($validated['site_id']) && !$this->canManageSiteNews($user, (int) $validated['site_id'])) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $sectionIds = $validated['section_ids'] ?? [];
        unset($validated['section_ids']);

        $news = News::create($validated);

        // Sync sections pivot
        if ($news->primary_section_id && !in_array($news->primary_section_id, $sectionIds)) {
            $sectionIds[] = $news->primary_section_id;
        }
        $syncData = [];
        foreach (array_values($sectionIds) as $pos => $sid) {
            $syncData[$sid] = ['position' => $pos];
        }
        $news->sections()->sync($syncData);

        return response()->json($news->load(['primarySection', 'sections']), 201);
    }

    public function siteStore($siteId, Request $request)
    {
        $resolved = $this->resolveSiteId($siteId);
        if ($resolved) {
            $request->merge(['site_id' => $resolved]);
        }
        return $this->store($request);
    }

    public function update(Request $request, News $news)
    {
        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!empty($news->site_id) && !$this->canManageSiteNews($user, (int) $news->site_id)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'primary_section_id' => 'nullable|exists:sections,id',
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:news,slug,' . $news->id,
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
            'section_ids' => 'nullable|array',
            'section_ids.*' => 'integer|exists:sections,id',
        ]);

        $sectionIds = $validated['section_ids'] ?? null;
        unset($validated['section_ids']);

        $news->update($validated);

        if ($sectionIds !== null) {
            $primary = $news->primary_section_id;
            if ($primary && !in_array($primary, $sectionIds)) {
                $sectionIds[] = $primary;
            }
            $syncData = [];
            foreach (array_values($sectionIds) as $pos => $sid) {
                $syncData[$sid] = ['position' => $pos];
            }
            $news->sections()->sync($syncData);
        }

        return response()->json($news->load(['primarySection', 'sections']));
    }

    public function destroy(Request $request, News $news)
    {
        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!empty($news->site_id) && !$this->canManageSiteNews($user, (int) $news->site_id)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $news->delete();
        return response()->json(null, 204);
    }

    public function reorder($siteId, Request $request)
    {
        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $resolved = $this->resolveSiteId($siteId);
        if (!$resolved) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        if (!$this->canReorderSiteNews($user, $resolved)) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $items = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:news,id',
            'items.*.position' => 'required|integer|min:0',
            'items.*.section_id' => 'nullable|integer|exists:sections,id',
        ])['items'];

        foreach ($items as $item) {
            $news = News::where('id', $item['id'])->where('site_id', $resolved)->first();
            if (!$news) {
                continue;
            }

            $sectionId = isset($item['section_id']) ? (int) $item['section_id'] : (int) ($news->primary_section_id ?? 0);
            if ($sectionId <= 0) {
                continue;
            }

            $updated = DB::table('news_section')
                ->where('news_id', $news->id)
                ->where('section_id', $sectionId)
                ->update(['position' => $item['position']]);

            if (!$updated) {
                DB::table('news_section')->insert([
                    'news_id' => $news->id,
                    'section_id' => $sectionId,
                    'position' => $item['position'],
                ]);
            }
        }

        return response()->json(['message' => 'Orden de noticias actualizado']);
    }
}
