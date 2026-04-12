import { cookies } from "next/headers";

/**
 * Resolve locale on the server side for pages like /about, /terms, /privacy.
 *
 * Priority:
 *   1. ?locale= searchParam (explicit, highest)
 *   2. round_locale cookie (synced by the client's useLocale hook)
 *   3. "ko-KR" default
 *
 * Returns { locale, isEn } for convenience.
 */
export async function resolveServerLocale(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ locale: string; isEn: boolean }> {
  // 1. Query param
  const qp = searchParams.locale;
  const fromQuery = Array.isArray(qp) ? qp[0] : qp;
  if (fromQuery && typeof fromQuery === "string") {
    const isEn = fromQuery.toLowerCase().startsWith("en");
    return { locale: fromQuery, isEn };
  }

  // 2. Cookie
  try {
    const jar = await cookies();
    const cookieVal = jar.get("round_locale")?.value;
    if (cookieVal) {
      const isEn = cookieVal.toLowerCase().startsWith("en");
      return { locale: cookieVal, isEn };
    }
  } catch {
    // cookies() can throw in some edge cases
  }

  // 3. Default
  return { locale: "ko-KR", isEn: false };
}
