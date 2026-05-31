/**
 * Proxy de Next.js 16 (antes `middleware.ts`).
 *
 * Corre en runtime Node. Hace un chequeo OPTIMISTA de la cookie de sesión para
 * proteger `/perfil`: si no hay cookie, redirige a `/login`. La validación real
 * de la sesión se hace en el server component de `/perfil`.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/perfil"],
};
