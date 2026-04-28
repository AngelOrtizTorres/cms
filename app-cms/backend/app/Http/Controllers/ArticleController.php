<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArticleController extends Controller
{
    /**
     * Obtener listado de artículos con paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Article::with(['section', 'user', 'tags', 'parent']);

            // Filtro por estado
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                $query->where('status', 'published');
            }

            // Filtrar por sección
            if ($request->has('section_id')) {
                $query->where('section_id', $request->section_id);
            }

            // Filtrar por sitio (website_id) mediante la sección
            if ($request->filled('website_id')) {
                $query->whereHas('section', function ($q) use ($request) {
                    $q->where('website_id', $request->website_id);
                });
            }

            // Filtrar por etiqueta
            if ($request->has('tag_id')) {
                $query->whereHas('tags', function ($q) {
                    $q->where('tags.id', request('tag_id'));
                });
            }

            // Búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%");
                });
            }

            // Ordenar - manejo del parámetro sort
            $sort = $request->get('sort', '-created_at');
            if (strpos($sort, '-') === 0) {
                $orderBy = substr($sort, 1);
                $orderDir = 'desc';
            } else {
                $orderBy = $sort;
                $orderDir = 'asc';
            }

            // Validar que el campo existe
            $allowedFields = ['id', 'title', 'created_at', 'updated_at', 'published_at', 'featured'];
            $orderBy = in_array($orderBy, $allowedFields) ? $orderBy : 'created_at';
            $query->orderBy($orderBy, $orderDir);

            $perPage = (int) $request->get('per_page', 10);
            $pagination = $query->paginate($perPage);

            // Transformar respuesta al formato esperado por el frontend
            $articles = $pagination->items();
            $transformedData = [];

            foreach ($articles as $article) {
                $transformedData[] = [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'excerpt' => $article->excerpt,
                    'content' => $article->content,
                    'featured_image' => $article->featured_image,
                    'gallery_images' => $article->gallery_images,
                    'featured' => $article->featured,
                    'status' => $article->status,
                    'meta_title' => $article->meta_title,
                    'meta_description' => $article->meta_description,
                    'created_at' => $article->created_at,
                    'updated_at' => $article->updated_at,
                    'published_at' => $article->published_at,
                    'section' => $article->section,
                    'user' => $article->user,
                    'tags' => $article->tags,
                ];
            }

            return response()->json([
                'data' => $transformedData,
                'meta' => [
                    'current_page' => $pagination->currentPage(),
                    'total' => $pagination->total(),
                    'per_page' => $pagination->perPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener artículos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener artículos destacados
     */
    public function featured(Request $request)
    {
        $limit = $request->get('limit', 6);
        $articles = Article::where('status', 'published')
            ->where('featured', true)
            ->with(['section', 'user', 'tags'])
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($articles);
    }

    /**
     * Obtener artículo por slug
     */
    public function bySlug($slug)
    {
        $article = Article::where('slug', $slug)
            ->where('status', 'published')
            ->with(['section', 'user', 'tags', 'parent'])
            ->firstOrFail();

        return response()->json($article);
    }

    /**
     * Crear artículo (solo autenticados)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:articles',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured' => 'boolean',
            'status' => 'required|in:draft,scheduled,published,archived',
            'section_id' => 'required|exists:sections,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'featured_image' => 'nullable|string',
            'gallery_images' => 'nullable|json',
            'tags' => 'nullable|array',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated['user_id'] = $user->id;
        $article = Article::create($validated);

        if ($request->has('tags')) {
            $article->tags()->sync($request->tags);
        }

        return response()->json($article->load(['section', 'user', 'tags']), 201);
    }

    /**
     * Actualizar artículo
     */
    public function update(Request $request, int $id)
    {
        $article = Article::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:articles,slug,' . $article->id,
            'excerpt' => 'nullable|string',
            'content' => 'string',
            'featured' => 'boolean',
            'status' => 'in:draft,scheduled,published,archived',
            'section_id' => 'exists:sections,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'featured_image' => 'nullable|string',
            'gallery_images' => 'nullable|json',
            'tags' => 'nullable|array',
        ]);

        $article->update($validated);

        if ($request->has('tags')) {
            $article->tags()->sync($request->tags);
        }

        return response()->json($article->load(['section', 'user', 'tags']));
    }

    /**
     * Eliminar artículo
     */
    public function destroy(int $id)
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(null, 204);
    }
}
