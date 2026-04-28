<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = MediaFile::query();
        $files = $query->latest()->paginate(50);
        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        $model = MediaFile::create([
            'user_id' => $request->user() ? $request->user()->id : null,
            'name' => $file->getClientOriginalName(),
            'file_name' => basename($path),
            'disk' => 'public',
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'width' => null,
            'height' => null,
            'alt_text' => null,
            'title' => null,
            'folder' => dirname($path),
        ]);

        $data = $model->toArray();
        $data['url'] = Storage::disk('public')->url($path);

        return response()->json($data, 201);
    }

    public function destroy(int $id)
    {
        $file = MediaFile::findOrFail($id);
        // attempt to delete file from disk
        if ($file->disk && $file->file_name) {
            $full = ($file->folder ? $file->folder . '/' : '') . $file->file_name;
            try {
                Storage::disk($file->disk)->delete($full);
            } catch (\Exception $e) {
                // ignore
            }
        }

        $file->delete();

        return response()->json(null, 204);
    }
}
