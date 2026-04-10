import { getSupabase } from "./supabase";

export interface QuestionResult {
  questionId: string;
  totalVotes: number;
  votesA: number;
  votesB: number;
  pctA: number;
  pctB: number;
}

/**
 * question_results view에서 실집계를 가져온다.
 * 없거나 실패하면 null → 호출자가 seed fallback.
 */
export async function getQuestionResult(
  questionId: string,
): Promise<QuestionResult | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from("question_results")
      .select("*")
      .eq("question_id", questionId)
      .single();

    if (error || !data) return null;

    return {
      questionId: data.question_id,
      totalVotes: Number(data.total_votes),
      votesA: Number(data.votes_a),
      votesB: Number(data.votes_b),
      pctA: Number(data.pct_a),
      pctB: Number(data.pct_b),
    };
  } catch {
    return null;
  }
}
