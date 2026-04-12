"use client";

import { useState } from "react";
import type { QuestionLocale } from "@/lib/types";

const SUPPORTED: QuestionLocale[] = ["ko-KR", "en-US", "en-PH", "en-GB"];
const COOKIE_NAME = "round_locale";
const DEFAULT_LOCALE: QuestionLocale = "ko-KR";

function normalize(raw: string | null | undefined): QuestionLocale | null {
  if (!raw) return null;
  const v = raw.trim();
  if (SUPPORTED.includes(v as QuestionLocale)) return v as QuestionLocale;
  const lower = v.toLowerCase().replace("_", "-");
  if (lower === "ko" || lower.startsWith("ko-")) return "ko-KR";
  if (lower === "en-us" || lower === "en") return "en-US";
  if (lower === "en-ph") return "en-PH";
  if (lower === "en-gb") return "en-GB";
  return null;
}

function readCookie(): QuestionLocale | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${COOKIE_NAME}=`))
    ?.slice(`${COOKIE_NAME}=`.length);
  return normalize(raw);
}

function writeCookie(locale: QuestionLocale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/**
 * Read the canonical locale from the round_locale cookie.
 *
 * The middleware sets this cookie on every request based on:
 *   subdomain → ?locale= → existing cookie → Accept-Language → ko-KR
 *
 * useLocale just reads it. No more multi-source resolution on the client.
 * setOverride writes the cookie directly for manual switches (admin, debug).
 */
export function useLocale(): {
  locale: QuestionLocale;
  ready: boolean;
  setOverride: (next: QuestionLocale | null) => void;
} {
  const [locale, setLocale] = useState<QuestionLocale>(() => readCookie() ?? DEFAULT_LOCALE);
  const ready = typeof window !== "undefined";

  const setOverride = (next: QuestionLocale | null) => {
    const resolved = next ?? DEFAULT_LOCALE;
    writeCookie(resolved);
    setLocale(resolved);
  };

  return { locale, ready, setOverride };
}
