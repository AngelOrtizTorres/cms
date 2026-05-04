<?php

namespace App\Http\Controllers;

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

        return response()->json($sections);
    }

    public function show($id)
    {
        $section = Section::with(['parent', 'children'])->findOrFail($id);
        return response()->json($section);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:sections,name',
            'slug' => 'nullable|string|unique:sections,slug',
            'parent_id' => 'nullable|exists:sections,id',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section = Section::create($validated);

        return response()->json($section, 201);
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required','string', Rule::unique('sections')->ignore($section->id)],
            'slug' => ['nullable','string', Rule::unique('sections')->ignore($section->id)],
            'parent_id' => 'nullable|exists:sections,id',
            'description' => 'nullable|string',
            'position' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $section->update($validated);

        return response()->json($section);
    }

    public function destroy($id)
    {
        $section = Section::findOrFail($id);

        // Prevent deleting a 'default' section if necessary (slug 'sin-categoria')
        if ($section->slug === 'sin-categoria') {
            return response()->json(['message' => 'No se puede eliminar la categoría por defecto'], 422);
        }

        $section->delete();

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
