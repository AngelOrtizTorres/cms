import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  // en producción no mostrar cabeceras en consola

  const token = req.cookies.get('token')?.value;

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isDev = process.env.NODE_ENV !== 'production';

  // Si la ruta es /dashboard/* y no hay token, redirigir a /login en producción
  if (isDashboard && !token) {
    if (!isDev) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }

    // en desarrollo, permitir que el cliente gestione la protección
  }

  return NextResponse.next();
}
