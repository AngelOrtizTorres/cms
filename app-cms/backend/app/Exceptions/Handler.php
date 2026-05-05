<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    /**
     * Lista de excepciones que no se reportan.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * Campos que no deben mostrarse en la sesión al fallar la validación.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        // Registro de reportes / render callbacks si se necesita
    }

    /**
     * Renderiza una excepción en una respuesta HTTP.
     * Intercepta TokenMismatchException y devuelve JSON para rutas API.
     */
    public function render($request, Throwable $e)
    {
        if ($e instanceof TokenMismatchException) {
            // Registrar información útil para depuración
            Log::warning('TokenMismatchException capturada', [
                'path' => $request->path(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'accept' => $request->header('Accept'),
                'x-requested-with' => $request->header('X-Requested-With'),
                'referer' => $request->header('Referer'),
                'cookies' => $request->cookies->all(),
            ]);

            // Detectar si la petición espera JSON (por cabeceras o por ruta API)
            $accept = $request->header('Accept', '');
            $wantsJson = $request->expectsJson()
                || (is_string($accept) && str_contains($accept, 'application/json'))
                || $request->header('X-Requested-With') === 'XMLHttpRequest'
                || $request->is('api/*');

            if ($wantsJson) {
                return response()->json([
                    'message' => 'Token CSRF inválido o expirado. Intente refrescar y reintentar.'
                ], 419);
            }

            return response()->view('errors.419', [], 419);
        }

        return parent::render($request, $e);
    }
}
