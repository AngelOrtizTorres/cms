<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Session\TokenMismatchException;

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
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Token CSRF inválido o expirado. Intente refrescar y reintentar.'
                ], 419);
            }

            return response()->view('errors.419', [], 419);
        }

        return parent::render($request, $e);
    }
}
