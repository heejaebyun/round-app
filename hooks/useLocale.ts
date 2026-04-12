"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { QuestionLocale } from "@/lib/types";
import { buildLocalizedPath, DEFAULT_LOCALE, getLocaleFromPathname } from "@/lib/localeRouting";

export function useLocale(): {
  locale: QuestionLocale;
  ready: boolean;
  setOverride: (next: QuestionLocale | null) => void;
} {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();

  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  const setOverride = (next: QuestionLocale | null) => {
    if (typeof window === "undefined") return;
    const targetLocale = next ?? DEFAULT_LOCALE;
    const target = buildLocalizedPath(pathname, targetLocale, searchParams);
    window.location.assign(target);
  };

  return {
    locale,
    ready: true,
    setOverride,
  };
}

