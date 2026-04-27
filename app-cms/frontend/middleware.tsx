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
  // Si la ruta es /dashboard/* y no hay token, redirigir a /login (server-side)
  if (isDashboard) {
    if (!token) {
      const loginUrl = new URL('/login', req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}