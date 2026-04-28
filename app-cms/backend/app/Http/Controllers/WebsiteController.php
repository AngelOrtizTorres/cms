<?php

namespace App\Http\Controllers;

use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebsiteController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $query = Website::with('user');

            if (!$user || !$user->hasRole('admin')) {
                // Sólo devolver los sitios del usuario actual
                if ($user) {
                    $query->where('user_id', $user->id);
                } else {
                    $query->whereNull('id');
                }
            }

            $websites = $query->orderBy('created_at', 'desc')->get();

            return response()->json($websites);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener sitios', 'message' => $e->getMessage()], 500);
        }
    }

    public function show(int $id)
    {
        $website = Website::with('user')->findOrFail($id);
        // Autorizar apertura del panel: sólo el creador puede acceder al panel del sitio
        $this->authorize('open', $website);
        return response()->json($website);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $user = Auth::user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $validated['user_id'] = $user->id;
        $website = Website::create($validated);

        return response()->json($website, 201);
    }

    public function update(Request $request, int $id)
    {
        $website = Website::findOrFail($id);
        $this->authorize('update', $website);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'url' => 'string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $website->update($validated);

        return response()->json($website);
    }

    public function destroy(int $id)
    {
        $website = Website::findOrFail($id);
        $this->authorize('delete', $website);
        $website->delete();
        return response()->json(null, 204);
    }
}
