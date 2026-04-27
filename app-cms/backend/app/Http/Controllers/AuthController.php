<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $token = $user->createToken('cms-token')->plainTextToken;

        // Crear cookie HttpOnly para que el middleware del frontend la pueda leer en el servidor
        $minutes = 60 * 24 * 7; // 7 días
        $cookie = cookie('token', $token, $minutes, '/', null, false, true, false, 'Lax');

        return response()->json([
            'user' => $user->load('roles'),
            'token' => $token
        ])->withCookie($cookie);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated'
            ], 401);
        }

        return response()->json([
            'user' => $user->load('roles')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        // Eliminar cookie 'token'
        $cookie = cookie('token', '', -1, '/');

        return response()->json([
            'message' => 'Logout correcto'
        ])->withCookie($cookie);
    }
}