"use client";

import { useEffect, useState } from "react";
import type { QuestionLocale } from "@/lib/types";

const SUPPORTED: QuestionLocale[] = ["ko-KR", "en-US", "en-PH", "en-GB"];
const STORAGE_KEY = "round_locale_override";
const DEFAULT_LOCALE: QuestionLocale = "ko-KR";

function normalize(raw: string | null | undefined): QuestionLocale | null {
  if (!raw) return null;
  const v = raw.trim();
  if (SUPPORTED.includes(v as QuestionLocale)) return v as QuestionLocale;

  // Best-effort normalize loose inputs like "en", "en_us", "en_ph"
  const lower = v.toLowerCase().replace("_", "-");
  if (lower === "ko" || lower.startsWith("ko-")) return "ko-KR";
  if (lower === "en-us" || lower === "en") return "en-US";
  if (lower === "en-ph") return "en-PH";
  if (lower === "en-gb") return "en-GB";
  return null;
}

/**
 * Resolve the active locale for the current session.
 *
 * Priority (highest first):
 *   1. `?locale=...` query string (debug override, per-tab)
 *   2. `localStorage.round_locale_override` (persistent manual override)
 *   3. `navigator.language`
 *   4. `DEFAULT_LOCALE` (ko-KR)
 *
 * Returns `null` until the first client render completes so that SSR
 * markup never locks in the wrong locale.
 */
export function useLocale(): {
  locale: QuestionLocale;
  ready: boolean;
  setOverride: (next: QuestionLocale | null) => void;
} {
  const [locale, setLocale] = useState<QuestionLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. query string
    const params = new URLSearchParams(window.location.search);
    const qs = normalize(params.get("locale"));
    if (qs) {
      setLocale(qs);
      setReady(true);
      return;
    }

    // 2. localStorage override
    try {
      const stored = normalize(window.localStorage.getItem(STORAGE_KEY));
      if (stored) {
        setLocale(stored);
        setReady(true);
        return;
      }
    } catch {
      // ignore storage errors (private mode etc.)
    }

    // 3. navigator.language
    const nav = normalize(navigator.language);
    if (nav) {
      setLocale(nav);
      setReady(true);
      return;
    }

    // 4. default
    setLocale(DEFAULT_LOCALE);
    setReady(true);
  }, []);

  const setOverride = (next: QuestionLocale | null) => {
    if (typeof window === "undefined") return;
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, next);
        setLocale(next);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        // fall back to navigator detection
        const nav = normalize(navigator.language) ?? DEFAULT_LOCALE;
        setLocale(nav);
      }
    } catch {
      // ignore
    }
  };

  return { locale, ready, setOverride };
}
