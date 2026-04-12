import { NextRequest, NextResponse } from "next/server";

/**
 * Locale middleware — single source of truth for the round_locale cookie.
 *
 * Priority (evaluated once per request, top wins):
 *   1. Subdomain: us.* → en-US, ph.* → en-PH
 *   2. ?locale= query param (deep-link / debug override)
 *   3. Existing round_locale cookie (session continuity)
 *   4. Accept-Language header (first-visit auto-detect)
 *   5. Default: ko-KR
 *
 * The resolved locale is always written to the round_locale cookie.
 * All downstream code (useLocale, serverLocale, pages) reads this
 * cookie as the canonical locale. No more multi-source conflicts.
 *
 * If ?locale= is present, the middleware also strips it from the URL
 * via redirect so the user sees a clean URL and the cookie carries
 * the value forward. Exception: ?q= deep-link params are preserved.
 */

const COOKIE_NAME = "round_locale";
const DEFAULT_LOCALE = "ko-KR";
const SUPPORTED = new Set(["ko-KR", "en-US", "en-PH", "en-GB"]);

const SUBDOMAIN_MAP: Record<string, string> = {
  us: "en-US",
  ph: "en-PH",
};

function normalize(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase().replace("_", "-");
  if (v === "ko" || v.startsWith("ko-")) return "ko-KR";
  if (v === "en-us" || v === "en") return "en-US";
  if (v === "en-ph") return "en-PH";
  if (v === "en-gb") return "en-GB";
  if (v.startsWith("en")) return "en-US";
  return null;
}

function parseAcceptLanguage(header: string): string | null {
  const parts = header.split(",").map((s) => {
    const [lang, qPart] = s.trim().split(";");
    const q = qPart ? parseFloat(qPart.replace(/q\s*=\s*/, "")) : 1;
    return { lang: lang.trim(), q: Number.isFinite(q) ? q : 0 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { lang } of parts) {
    const n = normalize(lang);
    if (n && SUPPORTED.has(n)) return n;
  }
  return null;
}

function getSubdomainLocale(host: string): string | null {
  const parts = host.split(".");
  if (parts.length < 2) return null;
  return SUBDOMAIN_MAP[parts[0].toLowerCase()] ?? null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const url = request.nextUrl.clone();
  const queryLocale = url.searchParams.get("locale");

  // ── Resolve locale ───────────────────────────────────────────
  let resolved: string | null = null;

  // 1. Subdomain
  resolved = getSubdomainLocale(host);

  // 2. ?locale= query
  if (!resolved && queryLocale) {
    resolved = normalize(queryLocale);
  }

  // 3. Existing cookie
  if (!resolved) {
    const existing = request.cookies.get(COOKIE_NAME)?.value;
    if (existing && SUPPORTED.has(existing)) {
      resolved = existing;
    }
  }

  // 4. Accept-Language
  if (!resolved) {
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) {
      resolved = parseAcceptLanguage(acceptLang);
    }
  }

  // 5. Default
  if (!resolved) {
    resolved = DEFAULT_LOCALE;
  }

  // ── Set cookie + optionally strip ?locale= from URL ──────────
  const needsRedirect = queryLocale && !getSubdomainLocale(host);

  if (needsRedirect) {
    // Strip ?locale= so the URL stays clean. Keep other params (?q= etc).
    url.searchParams.delete("locale");
    const response = NextResponse.redirect(url, 307);
    response.cookies.set(COOKIE_NAME, resolved, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, resolved, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|manifest.json|api/).*)"],
};
