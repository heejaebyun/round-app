import { getSupabase } from "./supabase";
import type { QuestionMetricsSnapshot, QuestionSplitGrade } from "./types";

interface MetricsRow {
  question_id: string;
  vote_count: number;
  reason_ctr: number;
  reply_rate: number;
  next_rate: number;
  split_score: number;
  split_grade: string;
  heat_score: number;
  longevity_score: number;
  captured_at: string;
  // v2 quality signals (may not exist in DB yet)
  skip_rate?: number;
  feedback_rate?: number;
  reason_engagement_rate?: number;
  quality_score?: number;
}

function mapRow(row: MetricsRow): QuestionMetricsSnapshot {
  return {
    questionId: row.question_id,
    timestamp: row.captured_at,
    voteCount: row.vote_count,
    reasonCtr: row.reason_ctr,
    replyRate: row.reply_rate,
    nextRate: row.next_rate,
    splitScore: row.split_score,
    splitGrade: row.split_grade as QuestionSplitGrade,
    heatScore: row.heat_score,
    longevityScore: row.longevity_score,
    skipRate: row.skip_rate,
    feedbackRate: row.feedback_rate,
    reasonEngagementRate: row.reason_engagement_rate,
    qualityScore: row.quality_score,
  };
}

/** Load metrics snapshot for a single question */
export async function getQuestionMetrics(questionId: string): Promise<QuestionMetricsSnapshot | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("question_metrics_snapshot")
      .select("*")
      .eq("question_id", questionId)
      .maybeSingle();
    if (error || !data) return null;
    return mapRow(data as MetricsRow);
  } catch { return null; }
}

/** Load metrics for multiple questions at once */
export async function getQuestionMetricsBatch(questionIds: string[]): Promise<Map<string, QuestionMetricsSnapshot>> {
  const sb = getSupabase();
  const map = new Map<string, QuestionMetricsSnapshot>();
  if (!sb || questionIds.length === 0) return map;
  try {
    const { data, error } = await sb
      .from("question_metrics_snapshot")
      .select("*")
      .in("question_id", questionIds);
    if (error || !data) return map;
    for (const row of data as MetricsRow[]) {
      map.set(row.question_id, mapRow(row));
    }
    return map;
  } catch { return map; }
}

/** Upsert a metrics snapshot (insert or update by question_id) */
export async function upsertQuestionMetrics(snapshot: QuestionMetricsSnapshot): Promise<{ ok: boolean }> {
  const sb = getSupabase();
  if (!sb) return { ok: false };
  try {
    const row: Record<string, unknown> = {
        question_id: snapshot.questionId,
        vote_count: snapshot.voteCount,
        reason_ctr: snapshot.reasonCtr,
        reply_rate: snapshot.replyRate,
        next_rate: snapshot.nextRate,
        split_score: snapshot.splitScore,
        split_grade: snapshot.splitGrade,
        heat_score: snapshot.heatScore ?? 0,
        longevity_score: snapshot.longevityScore ?? 0,
        captured_at: snapshot.timestamp,
    };
    // v2 columns — include if present so they get stored when DB supports them
    if (snapshot.skipRate != null) row.skip_rate = snapshot.skipRate;
    if (snapshot.feedbackRate != null) row.feedback_rate = snapshot.feedbackRate;
    if (snapshot.reasonEngagementRate != null) row.reason_engagement_rate = snapshot.reasonEngagementRate;
    if (snapshot.qualityScore != null) row.quality_score = snapshot.qualityScore;

    const { error } = await sb
      .from("question_metrics_snapshot")
      .upsert(row, { onConflict: "question_id" });
    if (error) { console.warn("[Round] metrics upsert failed:", error.message); return { ok: false }; }
    return { ok: true };
  } catch { return { ok: false }; }
}
