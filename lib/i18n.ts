import type { QuestionLocale } from "./types";

/**
 * Minimal feed-level UI dictionary.
 *
 * Intentionally tiny. We only translate the strings that block us
 * from testing en-US / en-PH at all. Anything that's not in here
 * stays Korean on purpose — full i18n is a later pass.
 */
export type UIKey =
  | "next"
  | "skip"
  | "shareQuestion"
  | "shareCopied"
  | "shareFailed"
  | "viewOpinions"
  | "dislikeQuestion"
  | "likedMark"
  | "sameSide"
  | "oppositeSide"
  | "totalVotesSuffix"
  | "counting"
  | "swipeHint";

type Dict = Record<UIKey, string>;

const KO: Dict = {
  next: "다음 질문",
  skip: "건너뛰기",
  shareQuestion: "질문 공유",
  shareCopied: "질문 링크를 복사했어요",
  shareFailed: "공유에 실패했어요",
  viewOpinions: "의견",
  dislikeQuestion: "질문 별로예요",
  likedMark: "좋아요",
  sameSide: "같은 선택",
  oppositeSide: "반대 선택",
  totalVotesSuffix: "명 참여",
  counting: "집계 중…",
  swipeHint: "다음 질문",
};

const EN: Dict = {
  next: "Next",
  skip: "Skip",
  shareQuestion: "Share",
  shareCopied: "Link copied",
  shareFailed: "Share failed",
  viewOpinions: "Voices",
  dislikeQuestion: "Not my thing",
  likedMark: "Liked",
  sameSide: "Same pick",
  oppositeSide: "Opposite",
  totalVotesSuffix: " voted",
  counting: "Counting…",
  swipeHint: "Next question",
};

const DICTS: Record<QuestionLocale, Dict> = {
  "ko-KR": KO,
  "en-US": EN,
  "en-PH": EN,
  "en-GB": EN,
};

/** Look up a UI string for the given locale. Falls back to Korean. */
export function t(locale: QuestionLocale | string | null | undefined, key: UIKey): string {
  const dict = (locale && DICTS[locale as QuestionLocale]) || KO;
  return dict[key];
}

/** Convenience: build a resolver bound to a locale. */
export function createT(locale: QuestionLocale | string | null | undefined) {
  const dict = (locale && DICTS[locale as QuestionLocale]) || KO;
  return (key: UIKey) => dict[key];
}
