import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // DEBUG: mostrar la cabecera Cookie que llega al middleware
  try {
    // eslint-disable-next-line no-console
    console.log('[middleware] Cookie header:', req.headers.get('cookie'));
  } catch (e) {}

  const token = req.cookies.get('token')?.value;

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
    // Permitir el flujo de desarrollo local sin redirecciones server-side
    const isDev = process.env.NODE_ENV !== 'production';

    // Si la ruta es /dashboard/* y no hay token, redirigir a /login en producción
    if (isDashboard && !token) {
      if (!isDev) {
        const loginUrl = new URL('/login', req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
      }

      // en desarrollo, permitir que el cliente gestione la protección
      try {
        // eslint-disable-next-line no-console
        console.log('[middleware] Desarrollo: token ausente, permitiendo NextResponse.next()');
      } catch (e) {}
    }

  return NextResponse.next();
}