<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        // Get filter parameters
        $type = $request->query('type'); // 'images' or 'videos'
        $limit = $request->query('limit', 100);

        // Build query
        $query = MediaFile::orderBy('created_at', 'desc');

        // Filter by type if specified
        if ($type === 'images') {
            $query->whereIn('mime_type', ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);
        } elseif ($type === 'videos') {
            $query->whereIn('mime_type', ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']);
        }

        $files = $query->limit($limit)->get();

        // Format response with URLs
        $formatted = $files->map(function (MediaFile $file) {
            $url = Storage::url($file->file_name);
            return [
                'id' => $file->id,
                'title' => $file->title ?? $file->name,
                'url' => $url,
                'thumbnail_url' => $url, // For now, same as url. Could generate thumbnails later
                'mime_type' => $file->mime_type,
                'name' => $file->name,
                'size' => $file->size,
                'width' => $file->width,
                'height' => $file->height,
                'alt_text' => $file->alt_text,
                'created_at' => $file->created_at,
            ];
        });

        return response()->json($formatted);
    }

    public function store(Request $request)
    {
        // Check authentication with fallbacks
        $user = Auth::guard('web')->user();

        if (!$user) {
            // Try bearer token if session didn't work
            $token = $request->bearerToken();
            if ($token) {
                $user = User::where('api_token', $token)->first();
                if ($user) Auth::login($user);
            }
        }

        if (!$user && !Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'file' => 'required|file|max:8192',
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $media = MediaFile::create([
            'user_id' => Auth::id(),
            'name' => $file->getClientOriginalName(),
            'file_name' => $path,
            'disk' => 'public',
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'width' => null,
            'height' => null,
            'alt_text' => null,
            'title' => null,
            'folder' => 'media',
        ]);

        // Return formatted response with URL
        $url = Storage::url($path);
        $media->url = $url;
        $media->thumbnail_url = $url;

        return response()->json($media, 201);
    }

    public function destroy(Request $request, $id)
    {
        // Check authentication with fallbacks
        $user = Auth::guard('web')->user();

        if (!$user) {
            // Try bearer token if session didn't work
            $token = $request->bearerToken();
            if ($token) {
                $user = User::where('api_token', $token)->first();
                if ($user) Auth::login($user);
            }
        }

        if (!$user && !Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $media = MediaFile::findOrFail($id);
        try {
            Storage::disk($media->disk ?? 'public')->delete($media->file_name);
        } catch (\Exception $e) {
            // ignore file delete errors
        }

        $media->delete();
        return response()->json(null, 204);
    }
}
