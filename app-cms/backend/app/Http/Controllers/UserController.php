<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class UserController extends Controller
{
    protected function getAuthUser(Request $request): ?User
    {
        // Primero intentamos autenticación por Bearer token (api_token)
        $token = $request->bearerToken();
        if ($token) {
            $u = User::where('api_token', $token)->first();
            if ($u) return $u;
        }

        // Fallback: intentar autenticación por sesión (Sanctum/web guard)
        try {
            $sessionUser = null;
            if (method_exists($request, 'user')) {
                $sessionUser = $request->user();
            }
            if (!$sessionUser) {
                $sessionUser = Auth::user();
            }
            if ($sessionUser instanceof User) {
                return $sessionUser;
            }
        } catch (\Throwable $e) {
            // ignore and fallthrough
        }

        return null;
    }

    public function index(Request $request)
    {
        $auth = $this->getAuthUser($request);
        if (!$auth) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $auth->getRoleNames()->first() ?? ($auth->role ?? 'user');
        if ($role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $users = User::orderBy('id', 'asc')->get()->map(function ($u) {
            $r = $u->getRoleNames()->first() ?? ($u->role ?? 'user');
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $r,
                'created_at' => $u->created_at?->toDateTimeString(),
            ];
        });

        return response()->json($users);
    }

    public function update(Request $request, $id)
    {
        $auth = $this->getAuthUser($request);
        if (!$auth) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $auth->getRoleNames()->first() ?? ($auth->role ?? 'user');
        if ($role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $data = $request->only(['name', 'email', 'role']);
        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['email'])) $user->email = $data['email'];

        if (isset($data['role'])) {
            $newRole = $data['role'];
            if (method_exists($user, 'syncRoles')) {
                try {
                    $user->syncRoles([$newRole]);
                } catch (\Throwable $e) {
                    // If Spatie not configured for this role, fallback to attribute
                    $user->role = $newRole;
                }
            } else {
                $user->role = $newRole;
            }
        }

        $user->save();

        $r = $user->getRoleNames()->first() ?? ($user->role ?? 'user');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $r,
        ]);
    }

    public function store(Request $request)
    {
        $auth = $this->getAuthUser($request);
        if (!$auth) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $auth->getRoleNames()->first() ?? ($auth->role ?? 'user');
        if ($role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string',
        ]);

        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->password = Hash::make($data['password']);
        $user->api_token = Str::random(60);

        if (isset($data['role'])) {
            $newRole = $data['role'];
            if (method_exists($user, 'assignRole')) {
                try {
                    $user->save();
                    $user->assignRole($newRole);
                } catch (\Throwable $e) {
                    // fallback to attribute
                    $user->role = $newRole;
                }
            } else {
                $user->role = $newRole;
            }
        }

        $user->save();

        $r = $user->getRoleNames()->first() ?? ($user->role ?? 'user');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $r,
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $auth = $this->getAuthUser($request);
        if (!$auth) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $auth->getRoleNames()->first() ?? ($auth->role ?? 'user');
        if ($role !== 'admin') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($auth->id == (int) $id) {
            return response()->json(['message' => 'No se puede eliminar a sí mismo'], 400);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
