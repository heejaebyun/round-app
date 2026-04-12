import type { Question, QuestionLocale } from "./types";
import { buildLocalizedPath } from "./localeRouting";

/**
 * Build a deep-link URL that opens Round directly on a specific question.
 * Format:
 *   /?q={questionId}
 *   /en-us?q={questionId}
 *   /en-ph?q={questionId}
 */
export function buildQuestionDeepLink(
  baseUrl: string,
  questionId: string,
  locale?: QuestionLocale | string | null,
): string {
  const base = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams({ q: questionId });
  const href = buildLocalizedPath("/", (locale as QuestionLocale | undefined) ?? "ko-KR", params);
  return `${base}${href}`;
}

/**
 * Build the plain-text share payload.
 *
 * Format:
 *   {question}
 *   A. {optionA}
 *   B. {optionB}
 *
 *   {url}
 *
 * No cheesy intro line. The question speaks for itself.
 * URL appears once — navigator.share({ url }) should NOT be set
 * separately or the link will duplicate on some platforms.
 */
export function buildQuestionShareText(
  question: Question,
  url: string,
  _locale?: QuestionLocale | string | null,
): string {
  const a = question.optionA?.label ?? "A";
  const b = question.optionB?.label ?? "B";
  return [
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
