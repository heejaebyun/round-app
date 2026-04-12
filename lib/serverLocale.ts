import { cookies } from "next/headers";

/**
 * Read the canonical locale on the server side.
 *
 * The middleware resolves locale from subdomain / query / cookie /
 * Accept-Language on every request and writes the round_locale cookie.
 * Server pages just read that cookie.
 *
 * searchParams is kept as a param for backward compat but is no longer
 * the primary source — the cookie is authoritative.
 */

export async function resolveServerLocale(
  _searchParams?: Record<string, string | string[] | undefined>,
): Promise<{ locale: string; isEn: boolean }> {
  try {
    const jar = await cookies();
    const cookieVal = jar.get("round_locale")?.value;
    if (cookieVal) {
      const isEn = cookieVal.toLowerCase().startsWith("en");
      return { locale: cookieVal, isEn };
    }
  } catch {
    // cookies() can throw in edge/static contexts
  }

  return { locale: "ko-KR", isEn: false };
}
