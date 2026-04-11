import type { Question, QuestionLocale } from "@/lib/types";
import { KR_STARTER, KR_FEED, KR_SEED } from "./questions.kr";
import { US_STARTER, US_FEED, US_SEED } from "./questions.us";
import { PH_STARTER, PH_FEED, PH_SEED } from "./questions.ph";

/**
 * Locale barrel for question pools.
 *
 * Policy:
 *   - ko-KR → KR pool (authoritative, always non-empty)
 *   - en-US → US pool, falls back to KR if US pool is empty
 *   - en-PH → PH pool, falls back to KR if PH pool is empty
 *   - anything else → KR pool
 *
 * The fallback lets us ship infra before we have locale-specific
 * seeds and still give users a working feed.
 */

export interface LocaleQuestionBundle {
  starter: Question[];
  feed: Question[];
  seed: Question[];
  /** True when the requested locale had its own pool; false when we fell back. */
  native: boolean;
}

function bundle(starter: Question[], feed: Question[], seed: Question[]): LocaleQuestionBundle {
  return { starter, feed, seed, native: true };
}

const KR_BUNDLE: LocaleQuestionBundle = bundle(KR_STARTER, KR_FEED, KR_SEED);

function krFallback(): LocaleQuestionBundle {
  return { ...KR_BUNDLE, native: false };
}

export function getQuestionsForLocale(locale: QuestionLocale | string | null | undefined): LocaleQuestionBundle {
  switch (locale) {
    case "ko-KR":
      return KR_BUNDLE;
    case "en-US":
      return US_STARTER.length > 0 || US_FEED.length > 0
        ? bundle(US_STARTER, US_FEED, US_SEED)
        : krFallback();
    case "en-PH":
      return PH_STARTER.length > 0 || PH_FEED.length > 0
        ? bundle(PH_STARTER, PH_FEED, PH_SEED)
        : krFallback();
    default:
      return KR_BUNDLE;
  }
}

// ── Legacy named exports — kept so existing importers still work ─────
// These resolve to the KR pool. Call getQuestionsForLocale(locale) in
// new code paths that need to vary by locale.
export const STARTER_QUESTIONS: Question[] = KR_STARTER;
export const FEED_QUESTIONS: Question[] = KR_FEED;
export const SEED_QUESTIONS: Question[] = KR_SEED;
