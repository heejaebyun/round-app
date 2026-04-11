import { getSupabase } from "./supabase";
import { getSupabaseAdmin } from "./supabaseAdmin";
import type {
  Category,
  Question,
  QuestionCandidate,
  QuestionCandidateInsert,
  QuestionCandidateReviewStatus,
  QuestionRiskTag,
  QuestionSourceType,
  QuestionStakes,
  QuestionTension,
  QuestionTopic,
  SnackTag,
} from "./types";

interface QuestionCandidateRow {
  id: string;
  review_status: QuestionCandidateReviewStatus;
  question: string;
  display_type: "text";
  category: Category;
  category_emoji: string;
  option_a_label: string;
  option_b_label: string;
  value_a: SnackTag;
  value_b: SnackTag;
  topic: QuestionTopic;
  subtopic: string | null;
  tension: QuestionTension;
  stakes: QuestionStakes | null;
  risk_tag: QuestionRiskTag[] | null;
  emotion_tag: string[] | null;
  audience_hint: string[] | null;
  locale: "ko-KR" | "en-US" | "en-GB";
  source_type: QuestionSourceType;
  source_note: string | null;
  result_a: number;
  result_b: number;
  total_votes: number;
  reasons: Array<{ side: "A" | "B"; text: string; likes: number }> | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_EMOJI: Record<Category, string> = {
  음식: "🍜",
  커리어: "💼",
  관계: "💕",
  소비: "💸",
  라이프: "🌿",
  여행: "✈️",
  트렌드: "🔥",
  Food: "🍜",
  Work: "💼",
  Relationships: "💕",
  Money: "💸",
  Lifestyle: "🌿",
  Travel: "✈️",
  Trends: "🔥",
};

function mapRowToCandidate(row: QuestionCandidateRow): QuestionCandidate {
  return {
    id: row.id,
    reviewStatus: row.review_status,
    question: row.question,
    category: row.category,
    categoryEmoji: row.category_emoji,
    optionA: { label: row.option_a_label },
    optionB: { label: row.option_b_label },
    valueA: row.value_a,
    valueB: row.value_b,
    displayType: row.display_type,
    topic: row.topic,
    subtopic: row.subtopic,
    tension: row.tension,
    stakes: row.stakes,
    riskTag: row.risk_tag ?? [],
    emotionTag: row.emotion_tag ?? [],
    audienceHint: row.audience_hint ?? [],
    locale: row.locale,
    sourceType: row.source_type,
    sourceNote: row.source_note,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRowToQuestion(row: QuestionCandidateRow): Question {
  return {
    id: row.id,
    qtype: "Snack",
    axis: null,
    displayType: "text",
    category: row.category,
    categoryEmoji: row.category_emoji,
    question: row.question,
    optionA: { label: row.option_a_label },
    optionB: { label: row.option_b_label },
    valueA: row.value_a,
    valueB: row.value_b,
    resultA: row.result_a,
    resultB: row.result_b,
    totalVotes: row.total_votes,
    reasons: row.reasons ?? [],
    topic: row.topic,
    subtopic: row.subtopic ?? undefined,
    tension: row.tension,
    stakes: row.stakes ?? undefined,
    riskTag: row.risk_tag ?? undefined,
    emotionTag: row.emotion_tag ?? undefined,
    audienceHint: row.audience_hint ?? undefined,
    locale: row.locale,
    sourceType: row.source_type,
    status: "test",
  };
}

function makeCandidateId() {
  return `cand-${crypto.randomUUID()}`;
}

export async function listQuestionCandidates(
  reviewStatus?: QuestionCandidateReviewStatus,
): Promise<QuestionCandidate[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  try {
    let query = sb.from("question_candidates").select("*").order("created_at", { ascending: false });
    if (reviewStatus) query = query.eq("review_status", reviewStatus);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as QuestionCandidateRow[]).map(mapRowToCandidate);
  } catch {
    return [];
  }
}

export async function createQuestionCandidate(
  input: QuestionCandidateInsert,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" };

  const row = {
    id: makeCandidateId(),
    review_status: "pending",
    question: input.question,
    display_type: "text",
    category: input.category,
    category_emoji: CATEGORY_EMOJI[input.category],
    option_a_label: input.optionA,
    option_b_label: input.optionB,
    value_a: input.valueA,
    value_b: input.valueB,
    topic: input.topic,
    subtopic: input.subtopic ?? null,
    tension: input.tension,
    stakes: input.stakes ?? null,
    risk_tag: input.riskTag ?? [],
    emotion_tag: input.emotionTag ?? [],
    audience_hint: input.audienceHint ?? [],
    locale: input.locale ?? "ko-KR",
    source_type: input.sourceType ?? "manual_editorial",
    source_note: input.sourceNote ?? null,
  };

  try {
    const { error } = await sb.from("question_candidates").insert(row);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: row.id };
  } catch {
    return { ok: false, error: "create failed" };
  }
}

export async function approveQuestionCandidate(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" };

  try {
    const { error } = await sb
      .from("question_candidates")
      .update({
        review_status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "approve failed" };
  }
}

export async function rejectQuestionCandidate(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" };

  try {
    const { error } = await sb
      .from("question_candidates")
      .update({
        review_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "reject failed" };
  }
}

export async function getApprovedQuestionCandidates(): Promise<Question[]> {
  const sb = getSupabase();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from("question_candidates")
      .select("*")
      .eq("review_status", "approved")
      .order("approved_at", { ascending: false });
    if (error || !data) return [];
    return (data as QuestionCandidateRow[]).map(mapRowToQuestion);
  } catch {
    return [];
  }
}
