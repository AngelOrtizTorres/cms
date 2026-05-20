<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Section;
use App\Models\Article;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
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

    public function show($id, Request $request)
    {
        // Si el identificador no es numérico, lo tratamos como slug y devolvemos
        // los artículos de esa sección (comportamiento esperado por el frontend)
        if (!is_numeric($id)) {
            $section = Section::where('slug', $id)->firstOrFail();

            $query = Article::whereHas('sections', function ($q) use ($section) {
                    $q->where('sections.id', $section->id);
                })
                ->where('status', 'published')
                ->with(['primarySection', 'sections', 'user', 'tags']);

            // Búsqueda
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
            'content' => 'nullable|json',
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
            'content' => 'nullable|json',
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

    /**
     * Batch reorder sections: accepts [{ id, position }, ...]
     * Only the site owner (author) or admin who owns the site may reorder.
     */
    public function reorder(Request $request)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                Auth::login($tokenUser);
            }
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Spec: only the author who owns the site can reorder; admin cannot reorder.
        if (($user->role ?? null) !== 'author') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $items = $request->validate([
            'items'            => 'required|array',
            'items.*.id'       => 'required|integer|exists:sections,id',
            'items.*.position' => 'required|integer|min:0',
            'site_id'          => 'nullable|integer',
        ])['items'];

        $siteId = (int) $request->input('site_id', 0);
        if ($siteId > 0) {
            $ownerId = null;
            try {
                $row = DB::table('sites')->where('id', $siteId)->first();
                if ($row && isset($row->owner_id)) {
                    $ownerId = (int) $row->owner_id;
                }
            } catch (\Exception $e) {
                $ownerId = null;
            }

            if ($ownerId === null) {
                $path = storage_path('app/sites.json');
                if (file_exists($path)) {
                    $json = @file_get_contents($path);
                    $arr = json_decode($json, true) ?? [];
                    foreach ($arr as $s) {
                        if (isset($s['id']) && (int) $s['id'] === $siteId && isset($s['owner_id'])) {
                            $ownerId = (int) $s['owner_id'];
                            break;
                        }
                    }
                }
            }

            if ($ownerId === null || $ownerId !== (int) $user->id) {
                return response()->json(['error' => 'Forbidden'], 403);
            }
        }

        foreach ($items as $item) {
            Section::where('id', $item['id'])->update(['position' => $item['position']]);
        }

        return response()->json(['message' => 'Orden actualizado']);
    }
}
