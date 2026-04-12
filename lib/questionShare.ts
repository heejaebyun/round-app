import type { Question, QuestionLocale } from "./types";
import { isEnglishLocale } from "./i18n";

/**
 * Build the plain-text payload we hand to `navigator.share` or paste
 * onto the clipboard when sharing a single feed question.
 *
 * Kept intentionally short so it survives SMS / DM clients without
 * being truncated.
 */
export function buildQuestionShareText(
  question: Question,
  url: string,
  locale?: QuestionLocale | string | null,
): string {
  const a = question.optionA?.label ?? "A";
  const b = question.optionB?.label ?? "B";
  const intro = isEnglishLocale(locale)
    ? "A question was shared with you. Join in and share your thoughts."
    : "질문이 공유되었어요. 참여하시고 생각을 남겨보세요.";
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
