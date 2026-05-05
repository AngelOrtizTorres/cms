<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tag;
use App\Models\Article;

class TagController extends Controller
{
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
}
