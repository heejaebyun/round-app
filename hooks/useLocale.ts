"use client";

import { useState } from "react";
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

const COOKIE_NAME = "round_locale";

function setCookieLocale(locale: QuestionLocale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function getCookieLocale(): QuestionLocale | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(`${COOKIE_NAME}=`.length);
  return normalize(raw);
}

function resolveClientLocale(): QuestionLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const params = new URLSearchParams(window.location.search);
  const qs = normalize(params.get("locale"));
  if (qs) {
    setCookieLocale(qs);
    return qs;
  }

  try {
    const stored = normalize(window.localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setCookieLocale(stored);
      return stored;
    }
  } catch {
    // ignore storage errors (private mode etc.)
  }

  const cookieLocale = getCookieLocale();
  if (cookieLocale) {
    setCookieLocale(cookieLocale);
    return cookieLocale;
  }

  const nav = normalize(window.navigator.language) ?? DEFAULT_LOCALE;
  setCookieLocale(nav);
  return nav;
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
  const [locale, setLocale] = useState<QuestionLocale>(resolveClientLocale);
  const ready = typeof window !== "undefined";

  const setOverride = (next: QuestionLocale | null) => {
    if (typeof window === "undefined") return;
    try {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, next);
        setCookieLocale(next);
        setLocale(next);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        const fallback = getCookieLocale() ?? normalize(navigator.language) ?? DEFAULT_LOCALE;
        setCookieLocale(fallback);
        setLocale(fallback);
      }
    } catch {
      // ignore
    }
  };

  return { locale, ready, setOverride };
}
