import type { Question } from "@/lib/types";

/**
 * Philippines (en-PH) question pool — Phase 1 infra only.
 *
 * Deliberately empty. Real seeds will come from the research pipeline
 * (`scripts/research.mjs --locale en-PH ...`) and be approved via the
 * admin candidates flow. Starting with en-PH English only; tl-PH
 * (Tagalog) waits for quality review.
 *
 * When this array is empty, `getQuestionsForLocale("en-PH")` falls
 * back to the KR pool so the feed still works during rollout.
 */
export const PH_STARTER: Question[] = [];
export const PH_FEED: Question[] = [];
export const PH_SEED: Question[] = [...PH_STARTER, ...PH_FEED];
