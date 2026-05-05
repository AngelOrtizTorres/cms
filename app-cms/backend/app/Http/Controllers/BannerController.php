<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::orderBy('display_order')->get();
        return response()->json($banners);
    }

    public function byPosition($position)
    {
        $banners = Banner::where('position', $position)
            ->where('active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json($banners);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string',
            'image_url' => 'nullable|string',
            'link_url' => 'nullable|string',
            'position' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        // Autenticación por token Bearer como fallback
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                Auth::login($tokenUser);
            }
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $banner = Banner::create($validated);
        return response()->json($banner, 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                Auth::login($tokenUser);
            }
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'type' => 'nullable|string',
            'image_url' => 'nullable|string',
            'link_url' => 'nullable|string',
            'position' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $banner->update($validated);
        return response()->json($banner);
    }

    public function destroy(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                Auth::login($tokenUser);
            }
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $banner->delete();
        return response()->json(null, 204);
    }

    // Site-scoped endpoints (best-effort: if site_id exists on table, filter by it)
    public function siteIndex($siteId)
    {
        $query = Banner::orderBy('display_order');
        try {
            // if the column exists, filter by it
            $query->where('site_id', $siteId);
        } catch (\Exception $e) {
            // ignore if column doesn't exist
        }

        return response()->json($query->get());
    }

    public function siteStore(Request $request, $siteId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string',
            'image_url' => 'nullable|string',
            'link_url' => 'nullable|string',
            'position' => 'nullable|string',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) {
                Auth::login($tokenUser);
            }
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Attach site_id if column present
        try {
            $validated['site_id'] = $siteId;
        } catch (\Exception $e) {
            // noop
        }

        $banner = Banner::create($validated);
        return response()->json($banner, 201);
    }
}
