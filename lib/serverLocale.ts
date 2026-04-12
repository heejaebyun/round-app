import { headers } from "next/headers";
import type { QuestionLocale } from "./types";
import { DEFAULT_LOCALE, normalizeLocale } from "./localeRouting";

const LOCALE_HEADER = "x-round-locale";

export async function resolveServerLocale(
  _searchParams?: Record<string, string | string[] | undefined>,
): Promise<{ locale: QuestionLocale; isEn: boolean }> {
  try {
    const requestHeaders = await headers();
    const headerLocale = normalizeLocale(requestHeaders.get(LOCALE_HEADER));
    const locale = headerLocale ?? DEFAULT_LOCALE;
    return { locale, isEn: locale.toLowerCase().startsWith("en") };
  } catch {
    return { locale: DEFAULT_LOCALE, isEn: false };
  }
}
