<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Article;
use Illuminate\Support\Facades\DB;

class TagController extends Controller
{
    // Resolve a site identifier (id or slug) to numeric id when possible
    private function resolveSiteId($siteIdentifier)
    {
        if (is_numeric($siteIdentifier)) return (int) $siteIdentifier;

        // try DB sites table
        try {
            $row = DB::table('sites')->where('slug', $siteIdentifier)->first();
            if ($row && isset($row->id)) return (int) $row->id;
        } catch (\Exception $e) {
            // ignore
        }

        // fallback to storage JSON used by SiteController
        $path = storage_path('app/sites.json');
        if (file_exists($path)) {
            $json = @file_get_contents($path);
            $arr = json_decode($json, true) ?? [];
            foreach ($arr as $s) {
                if (isset($s['slug']) && $s['slug'] === $siteIdentifier) return $s['id'];
            }
        }

        return null;
    }
    // List all tags
    public function index()
    {
        $tags = Tag::orderBy('name')->get();
        return response()->json($tags);
    }

    // Show tag by slug and return articles for that tag (paginated)
    public function show($slug, Request $request)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $query = Article::where('status', 'published')
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tags.id', $tag->id);
            })
            ->with(['primarySection', 'sections', 'user', 'tags']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 10);
        $articles = $query->orderBy('published_at', 'desc')
            ->paginate($perPage);

        return response()->json($articles);
    }

    // Site-scoped listing
    public function siteIndex($siteId, Request $request)
    {
        $resolved = $this->resolveSiteId($siteId);
        $query = Tag::orderBy('name');
        if ($resolved) {
            try {
                $query->where('site_id', $resolved);
            } catch (\Exception $e) {
                // ignore if column missing
            }
        }

        return response()->json($query->get());
    }

    // Site-scoped creation
    public function siteStore(Request $request, $siteId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:tags',
            'description' => 'nullable|string',
            'active' => 'nullable|boolean',
        ]);

        $resolved = $this->resolveSiteId($siteId);
        if ($resolved) {
            try {
                $validated['site_id'] = $resolved;
            } catch (\Exception $e) {
                // noop
            }
        }

        $tag = Tag::create($validated);
        return response()->json($tag, 201);
    }
}
