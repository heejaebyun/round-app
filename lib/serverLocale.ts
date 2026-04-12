import { cookies, headers } from "next/headers";

/**
 * Resolve locale on the server side for pages like /about, /terms, /privacy.
 *
 * Priority:
 *   1. ?locale= searchParam (explicit, highest)
 *   2. round_locale cookie (synced by the client's useLocale hook)
 *   3. Accept-Language header (first supported match)
 *   4. "ko-KR" default
 *
 * Returns { locale, isEn } for convenience.
 */

const SUPPORTED = ["ko-KR", "en-US", "en-PH", "en-GB"] as const;

function normalize(raw: string): string | null {
  const v = raw.trim().toLowerCase().replace("_", "-");
  if (v === "ko" || v.startsWith("ko-")) return "ko-KR";
  if (v === "en-us" || v === "en") return "en-US";
  if (v === "en-ph") return "en-PH";
  if (v === "en-gb") return "en-GB";
  if (v.startsWith("en")) return "en-US"; // broad English fallback
  return null;
}

function parseAcceptLanguage(header: string): string | null {
  // Accept-Language: en-US,en;q=0.9,ko;q=0.8
  const parts = header.split(",").map((s) => {
    const [lang, qPart] = s.trim().split(";");
    const q = qPart ? parseFloat(qPart.replace(/q\s*=\s*/, "")) : 1;
    return { lang: lang.trim(), q: Number.isFinite(q) ? q : 0 };
  });
  parts.sort((a, b) => b.q - a.q);
  for (const { lang } of parts) {
    const normalized = normalize(lang);
    if (normalized && SUPPORTED.includes(normalized as (typeof SUPPORTED)[number])) {
      return normalized;
    }
  }
  return null;
}

export async function resolveServerLocale(
  searchParams: Record<string, string | string[] | undefined>,
): Promise<{ locale: string; isEn: boolean }> {
  // 1. Query param
  const qp = searchParams.locale;
  const fromQuery = Array.isArray(qp) ? qp[0] : qp;
  if (fromQuery && typeof fromQuery === "string") {
    const n = normalize(fromQuery);
    if (n) return { locale: n, isEn: n.startsWith("en") };
  }

  // 2. Cookie
  try {
    const jar = await cookies();
    const cookieVal = jar.get("round_locale")?.value;
    if (cookieVal) {
      const n = normalize(cookieVal);
      if (n) return { locale: n, isEn: n.startsWith("en") };
    }
  } catch {
    // cookies() can throw in some edge cases
  }

  // 3. Accept-Language header
  try {
    const hdrs = await headers();
    const acceptLang = hdrs.get("accept-language");
    if (acceptLang) {
      const fromHeader = parseAcceptLanguage(acceptLang);
      if (fromHeader) return { locale: fromHeader, isEn: fromHeader.startsWith("en") };
    }
  } catch {
    // headers() can throw in edge/static contexts
  }

  // 4. Default
  return { locale: "ko-KR", isEn: false };
}
