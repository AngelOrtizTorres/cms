<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Section::query()->where('active', true);

        if ($request->filled('website_id')) {
            $query->where('website_id', $request->website_id);
        }

        if ($request->boolean('with_children')) {
            $query->with('children');
        }

        $sections = $query->orderBy('position')->get();

        return response()->json($sections);
    }

    public function bySlug(Request $request, string $slug)
    {
        $query = Section::where('slug', $slug)
            ->where('active', true)
            ->with('children');

        if ($request->filled('website_id')) {
            $query->where('website_id', $request->website_id);
        }

        $section = $query->firstOrFail();

        return response()->json($section);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:sections,id',
            'website_id' => 'nullable|exists:websites,id',
            'name' => 'required|string|max:255|unique:sections,name',
            'slug' => 'required|string|max:255|unique:sections,slug',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section = Section::create($validated);

        return response()->json($section, 201);
    }

    public function update(Request $request, int $id)
    {
        $section = Section::findOrFail($id);

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:sections,id',
            'website_id' => 'nullable|exists:websites,id',
            'name' => 'sometimes|string|max:255|unique:sections,name,' . $section->id,
            'slug' => 'sometimes|string|max:255|unique:sections,slug,' . $section->id,
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section->update($validated);

        return response()->json($section);
    }

    public function destroy(int $id)
    {
        $section = Section::findOrFail($id);
        $section->delete();

        return response()->json(null, 204);
    }
}
