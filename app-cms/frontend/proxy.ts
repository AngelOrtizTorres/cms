<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Evitar redirigir APIs o rutas internas
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
>>>>>>> main
  }

  return NextResponse.next();
}
<<<<<<< HEAD
=======

export const config = {
  matcher: ["/"],
};
>>>>>>> main
