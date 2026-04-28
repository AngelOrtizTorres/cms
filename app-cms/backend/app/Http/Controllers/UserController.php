<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()->with('roles')->orderBy('id')->paginate(20);

        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => 'nullable|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        if (!empty($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        return response()->json($user->load('roles'), 201);
    }

    public function update(Request $request, int $id)
    {
        $target = User::findOrFail($id);
        $actor = $request->user();

        if (!$actor) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        if ($actor->id !== $target->id && !$actor->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $target->id,
            'password' => ['sometimes', Password::min(8)],
            'role' => 'sometimes|string|exists:roles,name',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // `role` belongs to Spatie pivot tables, not to `users` columns.
        $role = $validated['role'] ?? null;
        unset($validated['role']);

        $target->update($validated);

        if ($role !== null && $actor->hasRole('admin')) {
            $target->syncRoles([$role]);
        }

        return response()->json($target->load('roles'));
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(null, 204);
    }
}
