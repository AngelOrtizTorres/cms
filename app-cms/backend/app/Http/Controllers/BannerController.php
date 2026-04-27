<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index()
    {
        $banners = Banner::where('active', true)
            ->orderBy('display_order')
            ->get();

        return response()->json($banners);
    }

    public function byPosition(string $position)
    {
        $allowed = ['header', 'sidebar', 'between_articles', 'footer'];

        if (!in_array($position, $allowed, true)) {
            return response()->json(['message' => 'Invalid position'], 422);
        }

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
            'type' => 'required|in:image,code',
            'image_url' => 'nullable|string|max:2048',
            'link_url' => 'nullable|string|max:2048',
            'code_content' => 'nullable|string',
            'position' => 'required|in:header,sidebar,between_articles,footer',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $banner = Banner::create($validated);

        return response()->json($banner, 201);
    }

    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:image,code',
            'image_url' => 'nullable|string|max:2048',
            'link_url' => 'nullable|string|max:2048',
            'code_content' => 'nullable|string',
            'position' => 'sometimes|in:header,sidebar,between_articles,footer',
            'display_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        $banner->update($validated);

        return response()->json($banner);
    }

    public function destroy(int $id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json(null, 204);
    }
}
