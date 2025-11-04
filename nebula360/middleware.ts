import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Rutas protegidas que requieren autenticación
  const isProtectedRoute = pathname.startsWith("/app");

  // Rutas de autenticación
  const isAuthRoute = pathname.startsWith("/auth/login");

  // Si intenta acceder a ruta protegida sin estar autenticado
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Si está autenticado e intenta acceder a la página de login, redirigir a /app
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};