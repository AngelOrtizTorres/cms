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
        // Authenticated listing
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }

        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $files = MediaFile::orderBy('created_at', 'desc')->get();
        return response()->json($files);
    }

    public function store(Request $request)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }

        if (!Auth::check()) {
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

        // Attach a public URL if possible
        $media->url = Storage::disk('public')->url($path);

        return response()->json($media, 201);
    }

    public function destroy(Request $request, $id)
    {
        $token = $request->bearerToken();
        if ($token && !Auth::check()) {
            $tokenUser = User::where('api_token', $token)->first();
            if ($tokenUser) Auth::login($tokenUser);
        }

        if (!Auth::check()) {
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
