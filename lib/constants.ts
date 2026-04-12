import type { Category } from "./types";

export const STORAGE_KEY_CHOICES = "round_choices";
export const STORAGE_KEY_INTRO_SEEN = "round_intro_seen_v1";
export const STORAGE_KEY_SWIPE_HINT_SEEN = "round_swipe_hint_seen_v1";

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
