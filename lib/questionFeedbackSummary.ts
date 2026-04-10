import { getSupabase } from "./supabase";
import type { QuestionFeedbackReason } from "./types";

export interface FeedbackSummary {
  questionId: string;
  total: number;
  byReason: Record<QuestionFeedbackReason, number>;
}

const EMPTY_REASONS: Record<QuestionFeedbackReason, number> = {
  liked: 0,
  too_obvious: 0,
  too_provocative: 0,
  weak_context: 0,
  too_similar: 0,
  not_interested: 0,
};

/** Get feedback summary for a single question */
export async function getQuestionFeedbackSummary(questionId: string): Promise<FeedbackSummary> {
  const sb = getSupabase();
  const empty: FeedbackSummary = { questionId, total: 0, byReason: { ...EMPTY_REASONS } };
  if (!sb) return empty;

  try {
    const { data, error } = await sb
      .from("question_feedback")
      .select("reason")
      .eq("question_id", questionId);

    if (error || !data) return empty;

    const byReason = { ...EMPTY_REASONS };
    for (const row of data as { reason: string }[]) {
      const r = row.reason as QuestionFeedbackReason;
      if (r in byReason) byReason[r]++;
    }

    return { questionId, total: data.length, byReason };
  } catch {
    return empty;
  }
}

/** Get feedback summaries for multiple questions */
export async function getQuestionFeedbackBatch(questionIds: string[]): Promise<Map<string, FeedbackSummary>> {
  const sb = getSupabase();
  const map = new Map<string, FeedbackSummary>();
  if (!sb || questionIds.length === 0) return map;

  try {
    const { data, error } = await sb
      .from("question_feedback")
      .select("question_id, reason")
      .in("question_id", questionIds);

    if (error || !data) return map;

    for (const row of data as { question_id: string; reason: string }[]) {
      if (!map.has(row.question_id)) {
        map.set(row.question_id, { questionId: row.question_id, total: 0, byReason: { ...EMPTY_REASONS } });
      }
      const summary = map.get(row.question_id)!;
      const r = row.reason as QuestionFeedbackReason;
      if (r in summary.byReason) summary.byReason[r]++;
      summary.total++;
    }

    return map;
  } catch {
    return map;
  }
}
