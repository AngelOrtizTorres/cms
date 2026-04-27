<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index()
    {
        $tags = Tag::where('active', true)->orderBy('name')->get();

        return response()->json($tags);
    }

    public function bySlug(string $slug)
    {
        $tag = Tag::where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return response()->json($tag);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:tags,name',
            'slug' => 'required|string|max:255|unique:tags,slug',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'active' => 'nullable|boolean',
        ]);

        $tag = Tag::create($validated);

        return response()->json($tag, 201);
    }

    public function update(Request $request, int $id)
    {
        $tag = Tag::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:tags,name,' . $tag->id,
            'slug' => 'sometimes|string|max:255|unique:tags,slug,' . $tag->id,
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'active' => 'nullable|boolean',
        ]);

        $tag->update($validated);

        return response()->json($tag);
    }

    public function destroy(int $id)
    {
        $tag = Tag::findOrFail($id);
        $tag->delete();

        return response()->json(null, 204);
    }
}
