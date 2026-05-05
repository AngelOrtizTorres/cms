<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;

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
        $resolved = $siteId;
        if (!is_numeric($siteId)) {
            // try resolve slug -> id
            try {
                $row = DB::table('sites')->where('slug', $siteId)->first();
                if ($row && isset($row->id)) $resolved = $row->id;
            } catch (\Exception $e) {
                $resolved = null;
            }
            if (!$resolved) {
                $path = storage_path('app/sites.json');
                if (file_exists($path)) {
                    $json = @file_get_contents($path);
                    $arr = json_decode($json, true) ?? [];
                    foreach ($arr as $s) {
                        if (isset($s['slug']) && $s['slug'] === $siteId) { $resolved = $s['id']; break; }
                    }
                }
            }
        }

        $query = Banner::orderBy('display_order');
        if ($resolved) {
            try { $query->where('site_id', $resolved); } catch (\Exception $e) { }
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

        // Attach resolved site_id if possible
        $resolved = $siteId;
        if (!is_numeric($siteId)) {
            try {
                $row = DB::table('sites')->where('slug', $siteId)->first();
                if ($row && isset($row->id)) $resolved = $row->id;
            } catch (\Exception $e) { $resolved = null; }
            if (!$resolved) {
                $path = storage_path('app/sites.json');
                if (file_exists($path)) {
                    $json = @file_get_contents($path);
                    $arr = json_decode($json, true) ?? [];
                    foreach ($arr as $s) {
                        if (isset($s['slug']) && $s['slug'] === $siteId) { $resolved = $s['id']; break; }
                    }
                }
            }
        }

        if ($resolved) $validated['site_id'] = $resolved;

        $banner = Banner::create($validated);
        return response()->json($banner, 201);
    }
}
