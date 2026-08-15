import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Edge middleware can't use jsonwebtoken (Node crypto), so we verify with
// `jose`, which works in the Edge runtime. Add "jose": "^5.6.3" to
// package.json dependencies — it's Edge/browser-safe and API-compatible
// enough for a simple HS256 verify like this.

const COOKIE_NAME = process.env.COOKIE_NAME || "mc_session";
const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminArea = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") || pathname.startsWith("/api/movies") || pathname.startsWith("/api/genres") || pathname.startsWith("/api/upload");

  if (!isAdminArea && !isAdminApi) return NextResponse.next();

  // Public GETs to /api/movies and /api/genres are allowed through; the
  // route handlers themselves enforce write protection via requireAdmin().
  if (isAdminApi && request.method === "GET" && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (isAdminArea && isLoginPage) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !JWT_SECRET) {
    return denyOrRedirect(request, isAdminArea);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return NextResponse.next();
  } catch {
    return denyOrRedirect(request, isAdminArea);
  }
}

function denyOrRedirect(request, isAdminArea) {
  if (isAdminArea) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/movies/:path*", "/api/genres/:path*", "/api/upload"],
};
