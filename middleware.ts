import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Permitir acesso à página inicial (login)
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Se não houver token, redirecionar para a página de login
  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Permitir acesso às rotas protegidas se houver token
  return NextResponse.next()
}

// Configurar quais rotas devem ser protegidas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
