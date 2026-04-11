import type { Question } from "./types";

/**
 * Build the plain-text payload we hand to `navigator.share` or paste
 * onto the clipboard when sharing a single feed question.
 *
 * Kept intentionally short so it survives SMS / DM clients without
 * being truncated.
 */
export function buildQuestionShareText(question: Question, url: string): string {
  const a = question.optionA?.label ?? "A";
  const b = question.optionB?.label ?? "B";
  return [
    "이거 진짜 갈리던데, 너라면 뭐 골라?",
    "",
    question.question,
    `A. ${a}`,
    `B. ${b}`,
    "",
    url,
  ].join("\n");
}

/**
 * Title line used for `navigator.share({ title })` on platforms
 * that surface it (e.g. iOS share sheet headline).
 */
export function buildQuestionShareTitle(question: Question): string {
  return question.question;
}
