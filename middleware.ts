import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain-based locale injection.
 *
 * Host mapping:
 *   us.round-app-one.vercel.app  → en-US
 *   ph.round-app-one.vercel.app  → en-PH
 *   round-app-one.vercel.app     → ko-KR (default)
 *   localhost:*                   → respects ?locale= or ko-KR
 *
 * Sets the round_locale cookie so server pages and client hooks
 * both see the same locale. The cookie is only set if the subdomain
 * implies a non-default locale or if one isn't already present.
 *
 * Runs on every request but does almost nothing — just a cookie set.
 */

const SUBDOMAIN_MAP: Record<string, string> = {
  us: "en-US",
  ph: "en-PH",
};

const COOKIE_NAME = "round_locale";
const DEFAULT_LOCALE = "ko-KR";

function getLocaleFromHost(host: string): string | null {
  // Extract subdomain: "us.round-app-one.vercel.app" → "us"
  const parts = host.split(".");
  if (parts.length < 2) return null;
  const sub = parts[0].toLowerCase();
  return SUBDOMAIN_MAP[sub] ?? null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subLocale = getLocaleFromHost(host);

  // If subdomain maps to a locale, inject/overwrite the cookie
  if (subLocale) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, subLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // Default host — set ko-KR cookie if none exists yet
  const existing = request.cookies.get(COOKIE_NAME)?.value;
  if (!existing) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, DEFAULT_LOCALE, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Run on all pages but skip static assets and API routes that
  // already handle auth themselves.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|manifest.json|api/).*)"],
};
