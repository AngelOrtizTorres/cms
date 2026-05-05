<?php

namespace App\Http\Controllers;

<<<<<<< HEAD
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
=======
use Illuminate\Http\Request;
use App\Models\Section;
use App\Models\Article;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SectionController extends Controller
{
    // List all sections (with parent/children and article counts)
    public function index(Request $request)
    {
        $sections = Section::with(['parent', 'children'])->orderBy('position')->get();

        // Compute article counts (primary + pivot) per section
        $sections = $sections->map(function ($s) {
            $primaryCount = Article::where('primary_section_id', $s->id)->count();
            $pivotCount = DB::table('article_section')->where('section_id', $s->id)->count();
            $s->articles_count = $primaryCount + $pivotCount;
            return $s;
        });
>>>>>>> main

        return response()->json($sections);
    }

<<<<<<< HEAD
    public function bySlug(Request $request, string $slug)
    {
        $query = Section::where('slug', $slug)
            ->where('active', true)
            ->with('children');

        if ($request->filled('website_id')) {
            $query->where('website_id', $request->website_id);
        }

        $section = $query->firstOrFail();

=======
    public function show($id)
    {
        $section = Section::with(['parent', 'children'])->findOrFail($id);
>>>>>>> main
        return response()->json($section);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
<<<<<<< HEAD
            'parent_id' => 'nullable|exists:sections,id',
            'website_id' => 'nullable|exists:websites,id',
            'name' => 'required|string|max:255|unique:sections,name',
            'slug' => 'required|string|max:255|unique:sections,slug',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
=======
            'name' => 'required|string|unique:sections,name',
            'slug' => 'nullable|string|unique:sections,slug',
            'parent_id' => 'nullable|exists:sections,id',
            'description' => 'nullable|string',
>>>>>>> main
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section = Section::create($validated);

        return response()->json($section, 201);
    }

<<<<<<< HEAD
    public function update(Request $request, int $id)
=======
    public function update(Request $request, $id)
>>>>>>> main
    {
        $section = Section::findOrFail($id);

        $validated = $request->validate([
<<<<<<< HEAD
            'parent_id' => 'nullable|exists:sections,id',
            'website_id' => 'nullable|exists:websites,id',
            'name' => 'sometimes|string|max:255|unique:sections,name,' . $section->id,
            'slug' => 'sometimes|string|max:255|unique:sections,slug,' . $section->id,
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
=======
            'name' => ['required','string', Rule::unique('sections')->ignore($section->id)],
            'slug' => ['nullable','string', Rule::unique('sections')->ignore($section->id)],
            'parent_id' => 'nullable|exists:sections,id',
            'description' => 'nullable|string',
>>>>>>> main
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section->update($validated);

        return response()->json($section);
    }

<<<<<<< HEAD
    public function destroy(int $id)
    {
        $section = Section::findOrFail($id);
        $section->delete();

        return response()->json(null, 204);
=======
    public function destroy($id)
    {
        $section = Section::findOrFail($id);

        // Prevent deleting a 'default' section if necessary (slug 'sin-categoria')
        if ($section->slug === 'sin-categoria') {
            return response()->json(['message' => 'No se puede eliminar la categoría por defecto'], 422);
        }

        $section->delete();

        return response()->json(['message' => 'Categoría eliminada']);
>>>>>>> main
    }
}
