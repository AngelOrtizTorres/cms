<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Schema;

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

        $role = $this->resolveUserRole($user) ?? 'user';

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
     * Forgot password - enviar enlace de reseteo por email
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Enlace de reseteo enviado']);
        }

        return response()->json(['message' => __($status)], 400);
    }

    /**
     * Reset password - aplicar el nuevo password usando token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                // invalidar tokens o hacer otras acciones post-reset
                $user->api_token = null;
                $user->save();

                $user->setRememberToken(Str::random(60));
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Password actualizado']);
        }

        return response()->json(['message' => __($status)], 400);
    }
    /**
     * Register an admin user via session (web) route.
     */
    public function registerAdmin(Request $request)
    {
        // Evitar crear un segundo administrador: comprobar si ya existe
        try {
            $adminExists = User::role('admin')->exists();
        } catch (\Throwable $e) {
            // Si el paquete de roles no está disponible, comprobar columnas existentes
            $adminExists = false;
            if (Schema::hasColumn('users', 'role')) {
                $adminExists = User::where('role', 'admin')->exists();
            } elseif (Schema::hasColumn('users', 'is_admin')) {
                $adminExists = User::where('is_admin', true)->exists();
            }
        }

        if ($adminExists) {
            return response()->json(['message' => 'Ya existe un administrador'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|confirmed|min:8',
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
        ]);

        // Assign admin role if roles are available
        try {
            if (method_exists($user, 'assignRole')) {
                $user->assignRole('admin');
            }
        } catch (\Throwable $e) {
            // ignore role assignment errors (seeder may not have run)
        }

        // Asegurar que el atributo/columna de rol queda como 'admin'
        // (fallback si Spatie no está configurado o la columna tiene default 'editor')
        try {
            if (Schema::hasColumn('users', 'role')) {
                $user->role = 'admin';
            } elseif (Schema::hasColumn('users', 'is_admin')) {
                $user->is_admin = true;
            }
            $user->save();
        } catch (\Throwable $e) {
            // ignorar errores al persistir el campo de rol
        }

        // Login the new user using session
        Auth::login($user);
        $request->session()->regenerate();

        $role = $this->resolveUserRole($user) ?? 'admin';

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
        ]);
    }

    /**
     * Comprueba si ya existe un usuario con rol 'admin'.
     * Devuelve JSON: { admin_exists: bool }
     */
    public function adminExists(Request $request)
    {
        try {
            $exists = User::role('admin')->exists();
        } catch (\Throwable $e) {
            $exists = false;
            if (Schema::hasColumn('users', 'role')) {
                $exists = User::where('role', 'admin')->exists();
            } elseif (Schema::hasColumn('users', 'is_admin')) {
                $exists = User::where('is_admin', true)->exists();
            }
        }

        return response()->json(['admin_exists' => (bool) $exists]);
    }

    /**
     * Login using session (Sanctum/web) flow. Expects CSRF cookie.
     */
    public function loginSession(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        try {
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }
        } catch (\Throwable $e) {
            // session not available in API context
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $role = $this->resolveUserRole($user) ?? 'user';

        // Also generate an api_token so the SPA can use bearer auth as fallback
        $token = bin2hex(random_bytes(40));
        $user->api_token = $token;
        $user->save();

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
     * Logout session-based auth
     */
    public function logoutSession(Request $request)
    {
        try {
            Auth::logout();
        } catch (\Throwable $e) {
            // ignore if no auth guard is active
        }

        // Session may not be available when running under API middleware
        try {
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        } catch (\Throwable $e) {
            // ignore session errors in API context
        }

        // Also invalidate token if sent
        try {
            $token = $request->bearerToken();
            if ($token) {
                $user = User::where('api_token', $token)->first();
                if ($user) {
                    $user->api_token = null;
                    $user->save();
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return response()->json(['message' => 'Logged out']);
    }
    /**
     * Me - devuelve el usuario autenticado por token
     */
    public function me(Request $request)
    {
        // If session auth present, return that user
        if (Auth::check()) {
            $user = Auth::user();
            $role = $this->resolveUserRole($user) ?? 'user';

            return response()->json([
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ]);
        }

        // Fallback: token-based auth (api_token)
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = User::where('api_token', $token)->first();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $role = $this->resolveUserRole($user) ?? 'user';

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
        ]);
    }

    /**
     * Session-based me endpoint (web route). Kept for explicit session calls.
     */
    public function sessionMe(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user = Auth::user();
        $role = $this->resolveUserRole($user) ?? 'user';

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $role,
        ]);
    }

    /**
     * Resolve the user's role in a safe way (supports Spatie or simple role column)
     */
    private function resolveUserRole(User $user): string
    {
        try {
            if (method_exists($user, 'getRoleNames')) {
                $names = $user->getRoleNames();
                if (is_object($names) && method_exists($names, 'first')) {
                    $first = $names->first();
                    if ($first) {
                        return (string) $first;
                    }
                }
                if (is_array($names) && count($names)) {
                    return (string) $names[0];
                }
                if (is_string($names) && $names !== '') {
                    return $names;
                }
            }
        } catch (\Throwable $e) {
            // ignore
        }

        return $user->role ?? 'user';
    }
}
