import type { QuestionLocale } from "./types";

export const DEFAULT_LOCALE: QuestionLocale = "ko-KR";

function isTossBuild(): boolean {
  return process.env.NEXT_PUBLIC_TOSS_BUILD === "1";
}

export const LOCALE_PREFIX_BY_CODE: Record<QuestionLocale, string> = {
  "ko-KR": "",
  "en-US": "/en-us",
  "en-PH": "/en-ph",
  "en-GB": "/en-gb",
};

const LOCALE_BY_PREFIX: Record<string, QuestionLocale> = {
  "en-us": "en-US",
  "en-ph": "en-PH",
  "en-gb": "en-GB",
};

export function normalizeLocale(raw: string | null | undefined): QuestionLocale | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase().replace(/_/g, "-");
  if (value === "ko" || value.startsWith("ko-")) return "ko-KR";
  if (value === "en" || value === "en-us") return "en-US";
  if (value === "en-ph") return "en-PH";
  if (value === "en-gb") return "en-GB";
  return null;
}

export function getLocaleFromPathname(pathname: string | null | undefined): QuestionLocale {
  if (isTossBuild()) return DEFAULT_LOCALE;
  if (!pathname) return DEFAULT_LOCALE;
  const [, firstSegment] = pathname.split("/");
  return LOCALE_BY_PREFIX[firstSegment?.toLowerCase() ?? ""] ?? DEFAULT_LOCALE;
}

export function stripLocalePrefix(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = clean.split("/");
  const firstSegment = segments[1]?.toLowerCase() ?? "";
  if (!LOCALE_BY_PREFIX[firstSegment]) {
    return clean || "/";
  }
  const stripped = `/${segments.slice(2).join("/")}`.replace(/\/+/g, "/");
  return stripped === "/" ? "/" : stripped.replace(/\/$/, "") || "/";
}

function normalizeSearch(search?: string | URLSearchParams | null): string {
  if (!search) return "";
  if (search instanceof URLSearchParams) {
    const text = search.toString();
    return text ? `?${text}` : "";
  }
  if (!search) return "";
  return search.startsWith("?") ? search : `?${search}`;
}

export function buildLocalizedPath(
  pathname: string,
  locale: QuestionLocale = DEFAULT_LOCALE,
  search?: string | URLSearchParams | null,
): string {
  const targetLocale = isTossBuild() ? DEFAULT_LOCALE : locale;
  const prefix = LOCALE_PREFIX_BY_CODE[targetLocale] ?? "";
  const cleanPath = stripLocalePrefix(pathname);
  const query = normalizeSearch(search);
  if (cleanPath === "/") {
    if (prefix) {
      return `${prefix}${query}`;
    }
    return query ? `/${query}` : "/";
  }
  return `${prefix}${cleanPath}${query}` || "/";
}
