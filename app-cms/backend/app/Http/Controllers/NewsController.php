<?php

namespace App\Http\Controllers;

use App\Models\News;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NewsController extends Controller
{
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
        $resolved = $siteId;
        if (!is_numeric($siteId)) {
            try {
                $row = DB::table('sites')->where('slug', $siteId)->first();
                if ($row && isset($row->id)) $resolved = $row->id;
            } catch (\Exception $e) { $resolved = null; }
            if (!$resolved) {
                $path = storage_path('app/sites.json');
                if (file_exists($path)) {
                    $json = @file_get_contents($path);
                    $arr = json_decode($json, true) ?? [];
                    foreach ($arr as $s) {
                        if (isset($s['slug']) && $s['slug'] === $siteId) { $resolved = $s['id']; break; }
                    }
                }
            }
        }

        $query = is_numeric($resolved) ? News::with(['primarySection', 'sections'])->where('site_id', $resolved) : News::with(['primarySection', 'sections'])->query();
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
        $resolved = $siteId;
        if (!is_numeric($siteId)) {
            try {
                $row = DB::table('sites')->where('slug', $siteId)->first();
                if ($row && isset($row->id)) $resolved = $row->id;
            } catch (\Exception $e) { $resolved = null; }
            if (!$resolved) {
                $path = storage_path('app/sites.json');
                if (file_exists($path)) {
                    $json = @file_get_contents($path);
                    $arr = json_decode($json, true) ?? [];
                    foreach ($arr as $s) {
                        if (isset($s['slug']) && $s['slug'] === $siteId) { $resolved = $s['id']; break; }
                    }
                }
            }
        }

        if ($resolved) $request->merge(['site_id' => $resolved]);
        return $this->store($request);
    }

    public function update(Request $request, News $news)
    {
        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
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

        $news->delete();
        return response()->json(null, 204);
    }
}
