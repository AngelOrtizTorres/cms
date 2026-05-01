<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Login - devuelve token y usuario
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // Generar token simple y guardarlo en la columna api_token
        $token = bin2hex(random_bytes(40));
        $user->api_token = $token;
        $user->save();

        $role = $user->getRoleNames()->first() ?? 'user';

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
        ]);
    }

    /**
     * Logout - anula el token actual
     */
    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        if ($token) {
            $user = User::where('api_token', $token)->first();
            if ($user) {
                $user->api_token = null;
                $user->save();
            }
        }

        return response()->json(['message' => 'Logged out']);
    }

    /**
     * Me - devuelve el usuario autenticado por token
     */
    public function me(Request $request)
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = User::where('api_token', $token)->first();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $user->getRoleNames()->first() ?? 'user';

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
        ]);
    }
}
