import type { Question } from "@/lib/types";

/**
 * US (en-US) question pool — Phase 1 infra only.
 *
 * Deliberately empty. Real seeds will come from the research pipeline
 * (`scripts/research.mjs --locale en-US ...`) and be approved via the
 * admin candidates flow.
 *
 * When this array is empty, `getQuestionsForLocale("en-US")` falls
 * back to the KR pool so the feed still works during rollout.
 */
export const US_STARTER: Question[] = [];
export const US_FEED: Question[] = [];
export const US_SEED: Question[] = [...US_STARTER, ...US_FEED];
