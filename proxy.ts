import { NextRequest, NextResponse } from "next/server";
import {
  buildLocalizedPath,
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  normalizeLocale,
  stripLocalePrefix,
} from "./lib/localeRouting";

const LOCALE_HEADER = "x-round-locale";

function withLocaleHeader(request: NextRequest, locale: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  return requestHeaders;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const pathLocale = getLocaleFromPathname(pathname);
  const strippedPath = stripLocalePrefix(pathname);
  const queryLocale = normalizeLocale(url.searchParams.get("locale"));

  // Backward compat: convert old ?locale= links into canonical locale paths.
  if (queryLocale) {
    url.searchParams.delete("locale");
    const target = buildLocalizedPath(strippedPath, queryLocale, url.searchParams);
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Locale-prefixed paths are canonical for non-Korean locales.
  if (pathLocale !== DEFAULT_LOCALE) {
    const requestHeaders = withLocaleHeader(request, pathLocale);
    url.pathname = strippedPath;
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // Bare paths always mean Korean.
  return NextResponse.next({
    request: {
      headers: withLocaleHeader(request, DEFAULT_LOCALE),
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|manifest.json|api/).*)"],
};
