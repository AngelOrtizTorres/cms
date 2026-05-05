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
        $query = News::query();

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

        $query = is_numeric($resolved) ? News::where('site_id', $resolved) : News::query();
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $list = $query->orderBy('published_at', 'desc')->get();
        return response()->json($list);
    }

    public function show($id)
    {
        $news = News::findOrFail($id);
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
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:news',
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        $this->tryTokenAuth($request);
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $news = News::create($validated);
        return response()->json($news, 201);
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
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:news,slug,' . $news->id,
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        $news->update($validated);
        return response()->json($news);
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
