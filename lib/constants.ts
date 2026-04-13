import type { Category } from "./types";

/** @deprecated Use getChoicesStorageKey(locale) instead */
export const STORAGE_KEY_CHOICES = "round_choices";

/** Locale-scoped storage key for choice history */
export function getChoicesStorageKey(locale: string): string {
  return `round_choices_${locale}`;
}

/**
 * One-time migration: move legacy "round_choices" into the ko-KR
 * scoped key so existing Korean users don't lose their history.
 */
export function migrateChoicesStorage() {
  if (typeof window === "undefined") return;
  const LEGACY = "round_choices";
  const KR_KEY = "round_choices_ko-KR";
  try {
    const legacy = localStorage.getItem(LEGACY);
    if (legacy && !localStorage.getItem(KR_KEY)) {
      localStorage.setItem(KR_KEY, legacy);
    }
    // Don't delete legacy yet — other code may still reference it
    // during the transition. It'll be cleaned up later.
  } catch {
    // ignore
  }
}
export const STORAGE_KEY_INTRO_SEEN = "round_intro_seen_v1";
/** @deprecated Use getSwipeHintKey(locale) instead */
export const STORAGE_KEY_SWIPE_HINT_SEEN = "round_swipe_hint_seen_v1";

export function getSwipeHintKey(locale: string): string {
  return `round_swipe_hint_seen_${locale}`;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  // ko-KR
  음식: "#FF7A59",
  커리어: "#3DDCFF",
  관계: "#FF4FA3",
  소비: "#F5B041",
  라이프: "#34D399",
  여행: "#8E6BFF",
  트렌드: "#FF5D5D",
  // en-* (parallel palette)
  Food: "#FF7A59",
  Work: "#3DDCFF",
  Relationships: "#FF4FA3",
  Money: "#F5B041",
  Lifestyle: "#34D399",
  Travel: "#8E6BFF",
  Trends: "#FF5D5D",
};
