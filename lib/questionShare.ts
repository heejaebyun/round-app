import type { Question, QuestionLocale } from "./types";
import { isEnglishLocale } from "./i18n";

/**
 * Build a deep-link URL that opens Round directly on a specific question.
 * Format: /?q={questionId} (+ &locale= if not ko-KR)
 */
export function buildQuestionDeepLink(
  baseUrl: string,
  questionId: string,
  locale?: QuestionLocale | string | null,
): string {
  const base = baseUrl.replace(/\/$/, "");
  const params = new URLSearchParams();
  params.set("q", questionId);
  if (locale && locale !== "ko-KR") {
    params.set("locale", String(locale));
  }
  return `${base}/?${params.toString()}`;
}

/**
 * Build the plain-text payload we hand to `navigator.share` or paste
 * onto the clipboard when sharing a single feed question.
 *
 * `url` should be a deep-link built by `buildQuestionDeepLink`.
 */
export function buildQuestionShareText(
  question: Question,
  url: string,
  locale?: QuestionLocale | string | null,
): string {
  const a = question.optionA?.label ?? "A";
  const b = question.optionB?.label ?? "B";
  const intro = isEnglishLocale(locale)
    ? "This one really splits people. Which side are you?"
    : "이거 진짜 갈리던데, 너라면 뭐 골라?";
  return [
    intro,
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
