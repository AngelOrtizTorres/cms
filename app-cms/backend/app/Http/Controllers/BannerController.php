<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Banner;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
        // Validate both JSON and multipart/form-data inputs
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|in:image,code',
            'image' => 'nullable|file|image|max:8192',
            'image_url' => 'nullable|string',
            'link' => 'nullable|string',
            'link_url' => 'nullable|string',
            'code_content' => 'nullable|string',
            'position' => 'nullable|in:header,sidebar,between_articles,footer',
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

        $data = [
            'title' => $validated['title'],
            'type' => $validated['type'] ?? 'image',
            'position' => $validated['position'] ?? 'header',
            'display_order' => $validated['display_order'] ?? 0,
            'active' => $validated['active'] ?? true,
            'code_content' => $validated['code_content'] ?? null,
            'link_url' => $validated['link_url'] ?? ($validated['link'] ?? null),
        ];

        // Handle uploaded image if present
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            try {
                $path = $file->store('banners', 'public');
                $data['image_url'] = Storage::disk('public')->url($path);
            } catch (\Exception $e) {
                // ignore storage errors and fallback to provided image_url if any
            }
        } elseif (!empty($validated['image_url'])) {
            $data['image_url'] = $validated['image_url'];
        }

        // If it's a code banner, ensure code_content exists
        if (($data['type'] ?? 'image') === 'code' && empty($data['code_content'])) {
            return response()->json(['message' => 'code_content is required for code banners'], 422);
        }

        $banner = Banner::create($data);
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
            'title' => 'nullable|string|max:255',
            'type' => 'nullable|in:image,code',
            'image' => 'nullable|file|image|max:8192',
            'image_url' => 'nullable|string',
            'link' => 'nullable|string',
            'link_url' => 'nullable|string',
            'code_content' => 'nullable|string',
            'position' => 'nullable|in:header,sidebar,between_articles,footer',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $data = [];
        if (isset($validated['title'])) $data['title'] = $validated['title'];
        if (isset($validated['type'])) $data['type'] = $validated['type'];
        if (isset($validated['position'])) $data['position'] = $validated['position'];
        if (isset($validated['display_order'])) $data['display_order'] = $validated['display_order'];
        if (isset($validated['active'])) $data['active'] = $validated['active'];
        if (isset($validated['code_content'])) $data['code_content'] = $validated['code_content'];
        if (isset($validated['link_url'])) $data['link_url'] = $validated['link_url'];
        if (isset($validated['link'])) $data['link_url'] = $validated['link'];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            try {
                $path = $file->store('banners', 'public');
                $data['image_url'] = Storage::disk('public')->url($path);
            } catch (\Exception $e) {
                // ignore storage errors
            }
        } elseif (!empty($validated['image_url'])) {
            $data['image_url'] = $validated['image_url'];
        }

        // If it's a code banner and code_content is empty, reject
        if ((isset($data['type']) ? $data['type'] : $banner->type) === 'code' && empty($data['code_content']) && empty($banner->code_content)) {
            return response()->json(['message' => 'code_content is required for code banners'], 422);
        }

        $banner->update($data);
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
