// --- Persona system types ---

export type Axis = "Action" | "Motivation" | "Relation" | "Reward";

/** ko-KR persona / reusable tag pool */
export const SNACK_TAGS_KO = [
  "야식파", "맵단짠러", "디저트덕후", "가성비파", "플렉서",
  "충동구매러", "신상헌터", "야행성", "집콕러", "핫플러",
  "갓생러", "숏폼중독", "앱테크족",
  // 현실 갈등형 재사용 태그 풀
  "현실파", "예의파", "직진파", "거리두기파", "공유파", "경계파",
  "의리파", "원칙파", "맞춤파", "직설파", "완곡파",
] as const;

/** en-* (US / PH / GB) persona / reusable tag pool */
export const SNACK_TAGS_EN = [
  "Realist", "Courteous", "Direct", "Reserved",
  "Open", "Private", "Loyal", "Principled",
  "Adaptive", "Diplomatic", "Planner", "Spontaneous",
] as const;

/**
 * Type union of all known tags. Kept as a single Question.valueA /
 * valueB type so components don't have to branch by locale, but the
 * research pipeline validates locale-appropriate tags separately
 * (SNACK_TAGS_KO for ko-KR, SNACK_TAGS_EN for en-*).
 */
export const SNACK_TAGS = [...SNACK_TAGS_KO, ...SNACK_TAGS_EN] as const;

export type SnackTagKo = (typeof SNACK_TAGS_KO)[number];
export type SnackTagEn = (typeof SNACK_TAGS_EN)[number];
export type SnackTag = SnackTagKo | SnackTagEn;

// --- Question types (discriminated union) ---

/**
 * Category values. ko-KR categories are Korean strings; en-* pools
 * use the English equivalents. Both live in the same union so a
 * Question can carry either without generic gymnastics.
 */
export type Category =
  // ko-KR
  | "음식"
  | "커리어"
  | "관계"
  | "소비"
  | "라이프"
  | "여행"
  | "트렌드"
  // en-*
  | "Food"
  | "Work"
  | "Relationships"
  | "Money"
  | "Lifestyle"
  | "Travel"
  | "Trends";

/** ko → en category mapping, used by the research pipeline to stay consistent */
export const CATEGORY_EN_BY_KO: Record<string, Category> = {
  "음식": "Food",
  "커리어": "Work",
  "관계": "Relationships",
  "소비": "Money",
  "라이프": "Lifestyle",
  "여행": "Travel",
  "트렌드": "Trends",
};

export type QuestionTopic = "relationship" | "money" | "manners" | "work" | "family" | "self" | "lifestyle" | "society";
export type QuestionTension =
  | "care_vs_principle"
  | "present_vs_future"
  | "freedom_vs_responsibility"
  | "stability_vs_growth"
  | "privacy_vs_openness"
  | "efficiency_vs_empathy"
  | "honesty_vs_harmony"
  | "fairness_vs_generosity";

export type QuestionStakes = "low" | "social" | "identity" | "financial";
export type QuestionRiskTag = "ragebait" | "gender_war" | "political" | "defamation_risk" | "too_niche" | "sensitive";
export type QuestionStatus = "test" | "rising" | "evergreen" | "archive";
export type QuestionSourceType = "community" | "news_comment" | "internal_submission" | "manual_editorial";
export type QuestionLocale = "ko-KR" | "en-US" | "en-PH" | "en-GB";
export type QuestionCandidateReviewStatus = "pending" | "approved" | "rejected";

interface BaseQuestion {
  id: string;
  displayType: "text" | "image";
  category: Category;
  categoryEmoji: string;
  question: string;
  optionA: { label: string; img?: string };
  optionB: { label: string; img?: string };
  resultA: number;
  resultB: number;
  totalVotes: number;
  reasons: Reason[];
  // Semantic metadata
  topic?: QuestionTopic;
  subtopic?: string;
  tension?: QuestionTension;
  stakes?: QuestionStakes;
  riskTag?: QuestionRiskTag[];
  emotionTag?: string[];
  audienceHint?: string[];
  locale?: QuestionLocale;
  // Lifecycle
  status?: QuestionStatus;
  sourceType?: QuestionSourceType;
}

export interface CoreQuestion extends BaseQuestion {
  qtype: "Core";
  axis: Axis;
  valueA: -10;
  valueB: 10;
}

export interface SnackQuestion extends BaseQuestion {
  qtype: "Snack";
  axis: null;
  valueA: SnackTag;
  valueB: SnackTag;
}

export type Question = CoreQuestion | SnackQuestion;

// --- Reason ---

export interface Reason {
  id?: string;
  side: "A" | "B";
  text: string;
  likes: number;
  likedByMe?: boolean;
}

// --- User data ---

export interface UserChoice {
  questionId: string;
  side: "A" | "B";
  category: Category;
  reason?: string;
  chosenAt: Date;
}

export interface UserScores {
  Action: number;
  Motivation: number;
  Relation: number;
  Reward: number;
}

// --- DNA ---

export interface ChoiceDNA {
  totalChoices: number;
  scores: UserScores;
  archetype: string;
  archetypeDescription: string;
  topTag: string | null;
  fullTitle: string; // [tag] + [archetype]
  tags: Record<string, number>;
}

// --- Members ---

export interface RoundMember {
  id: string;
  tossUserKey: number;
  name: string | null;
  email: string | null;
  nickname: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

// --- Question Operations ---

export type QuestionSplitGrade = "S" | "A" | "B" | "C";

/** Derived operating metrics — computed at runtime, not stored on question */
export interface QuestionOpsMetrics {
  splitScore: number;
  splitGrade: QuestionSplitGrade;
  topic: QuestionTopic | null;
  tension: QuestionTension | null;
  // Runtime metrics (populated when live data available)
  voteCount?: number;
  reasonCtr?: number;
  replyRate?: number;
  nextRate?: number;
  heatScore?: number;
  longevityScore?: number;
  // Quality signals (v2)
  skipRate?: number;
  feedbackRate?: number;
  reasonEngagementRate?: number;
  qualityScore?: number;
}

/** Point-in-time snapshot of question-level operating data */
export interface QuestionMetricsSnapshot {
  questionId: string;
  timestamp: string;
  voteCount: number;
  reasonCtr: number;
  replyRate: number;
  nextRate: number;
  splitScore: number;
  splitGrade: QuestionSplitGrade;
  heatScore?: number;
  longevityScore?: number;
  // Quality signals (v2 — derived from events + feedback)
  skipRate?: number;           // question_skipped / card_viewed (0–100)
  feedbackRate?: number;       // negative feedback / card_viewed (0–100)
  reasonEngagementRate?: number; // reason_engaged / result_viewed (0–100)
  qualityScore?: number;       // weighted composite (0–100)
}

/** Question quality feedback from users */
export type QuestionFeedbackReason =
  | "liked"            // 좋아요 (사유 없음)
  | "too_obvious"      // 답이 너무 뻔해요
  | "too_provocative"  // 너무 자극적이에요
  | "weak_context"     // 맥락이 약해요
  | "too_similar"      // 비슷한 질문이 많아요
  | "not_interested";  // 관심 없는 주제예요

export interface QuestionFeedbackInsert {
  question_id: string;
  device_id: string;
  reason: QuestionFeedbackReason;
}

// --- Question Candidates ---

export interface QuestionCandidate {
  id: string;
  reviewStatus: QuestionCandidateReviewStatus;
  question: string;
  category: Category;
  categoryEmoji: string;
  optionA: { label: string };
  optionB: { label: string };
  valueA: SnackTag;
  valueB: SnackTag;
  displayType: "text";
  topic: QuestionTopic;
  subtopic?: string | null;
  tension: QuestionTension;
  stakes?: QuestionStakes | null;
  riskTag?: QuestionRiskTag[];
  emotionTag?: string[];
  audienceHint?: string[];
  locale?: QuestionLocale;
  sourceType?: QuestionSourceType;
  sourceNote?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCandidateInsert {
  question: string;
  category: Category;
  optionA: string;
  optionB: string;
  valueA: SnackTag;
  valueB: SnackTag;
  topic: QuestionTopic;
  subtopic?: string;
  tension: QuestionTension;
  stakes?: QuestionStakes;
  riskTag?: QuestionRiskTag[];
  emotionTag?: string[];
  audienceHint?: string[];
  locale?: QuestionLocale;
  sourceType?: QuestionSourceType;
  sourceNote?: string;
}

// --- Admin / moderation ---

export interface AdminReplyItem {
  id: string;
  reasonId: string;
  questionId: string | null;
  questionText: string | null;
  reasonText: string;
  reasonSide: "A" | "B" | null;
  replyText: string;
  tone: ReplyTone;
  selectedOptionId: string | null;
  createdAt: string;
}

// --- Reason Reply ---

export type ReplyTone = "agree" | "rebuttal" | "comment";

export interface ReasonReply {
  id: string;
  reasonId: string;
  deviceId: string;
  text: string;
  tone: ReplyTone;
  selectedOptionId: string | null; // "A" | "B" or future option id
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
}

export interface ReplyInsert {
  reason_id: string;
  device_id: string;
  text: string;
  tone: ReplyTone;
  selected_option_id?: string | null;
}

// --- Supabase DB insert types ---

export interface VoteInsert {
  question_id: string;
  device_id: string;
  side: "A" | "B";
  user_id?: string | null;
}

export interface ReasonInsert {
  question_id: string;
  device_id: string;
  side: "A" | "B";
  text: string;
  user_id?: string | null;
}

export interface EventInsert {
  device_id: string;
  event_name: string;
  event_data?: Record<string, unknown>;
}
