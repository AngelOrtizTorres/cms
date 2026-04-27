<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'phone_number' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'source_url' => 'nullable|string|max:2048',
            'privacy_accepted' => 'required|accepted',
        ]);

        $validated['ip_address'] = $request->ip();
        $validated['user_agent'] = (string) $request->userAgent();

        $contactMessage = ContactMessage::create($validated);

        return response()->json($contactMessage, 201);
    }

    public function messages(Request $request)
    {
        $query = ContactMessage::query();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $messages = $query->latest()->paginate(20);

        return response()->json($messages);
    }

    public function destroyMessage(int $id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json(null, 204);
    }
}
