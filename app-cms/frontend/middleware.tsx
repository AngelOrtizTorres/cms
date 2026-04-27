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

  // En entorno de desarrollo evitar redirecciones server-side para no bloquear
  // el trabajo en local cuando las cookies entre dominios no están sincronizadas.
  // Devolver siempre NextResponse.next() para permitir que el cliente
  // gestione la protección de rutas.
  return NextResponse.next();
}