/**
 * Snapshot updater — computes question metrics from Supabase data.
 * Uses reason_engaged (not reason_viewed) for real engagement metrics.
 * Computes heat/longevity from actual activity.
 */

import { getSupabase } from "@/lib/supabase";
import { upsertQuestionMetrics } from "@/lib/questionMetrics";
import { splitScoreFromVotes, emptySnapshot, deriveQuestionStatus, getQuestionOpsMetrics } from "./questionOps";
import { splitGrade } from "./splitScore";
import {
  computeReasonCtr,
  computeHeatScore,
  computeLongevityScore,
  computeSkipRate,
  computeFeedbackRate,
  computeReasonEngagementRate,
  computeQualityScore,
} from "./scoring";
import type { QuestionSplitGrade, QuestionStatus } from "@/lib/types";
import { SEED_QUESTIONS } from "@/data/questions";
import { getApprovedQuestionCandidates } from "@/lib/questionCandidates";

interface VoteRow { question_id: string; side: string }
interface EventRow { event_name: string; event_data: Record<string, unknown>; created_at: string }

/**
 * Compute and persist a metrics snapshot for a single question.
 */
export async function updateQuestionSnapshot(questionId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    // ─── Vote counts ───
    const { data: votes } = await sb
      .from("votes")
      .select("question_id, side")
      .eq("question_id", questionId);

    const voteRows = (votes ?? []) as VoteRow[];
    const votesA = voteRows.filter((v) => v.side === "A").length;
    const votesB = voteRows.filter((v) => v.side === "B").length;
    const voteCount = votesA + votesB;

    // ─── Events ───
    const { data: events } = await sb
      .from("events")
      .select("event_name, event_data, created_at")
      .or(`event_data->>questionId.eq.${questionId},event_data->>question_id.eq.${questionId}`);

    const eventRows = (events ?? []) as EventRow[];

    // Count by event type
    const resultViewed = eventRows.filter((e) => e.event_name === "result_viewed").length;
    const reasonEngaged = eventRows.filter((e) => e.event_name === "reason_engaged").length;
    const replyWritten = eventRows.filter((e) => e.event_name === "reason_reply_written").length;
    const nextClicked = eventRows.filter((e) => e.event_name === "next_card_clicked").length;
    const cardViewed = eventRows.filter((e) => e.event_name === "card_viewed").length;
    const questionSkipped = eventRows.filter((e) => e.event_name === "question_skipped").length;

    // ─── Feedback (negative only, exclude 'liked') ───
    let negativeFeedbackCount = 0;
    try {
      const sbFb = getSupabase();
      if (sbFb) {
        const { data: fbRows } = await sbFb
          .from("question_feedback")
          .select("reason")
          .eq("question_id", questionId)
          .neq("reason", "liked");
        negativeFeedbackCount = fbRows?.length ?? 0;
      }
    } catch { /* ignore */ }

    // ─── Rates ───
    const reasonCtr = computeReasonCtr(reasonEngaged, resultViewed);
    const replyRate = cardViewed > 0 ? Math.round((replyWritten / cardViewed) * 100) : 0;
    const nextRate = cardViewed > 0 ? Math.round((nextClicked / cardViewed) * 100) : 0;

    // ─── Quality signals (v2) ───
    const skipRate = computeSkipRate(questionSkipped, cardViewed);
    const feedbackRate = computeFeedbackRate(negativeFeedbackCount, cardViewed);
    const reasonEngagementRate = computeReasonEngagementRate(reasonEngaged, resultViewed);

    // ─── Split ───
    const ss = splitScoreFromVotes(votesA, votesB);
    const total = votesA + votesB;
    const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
    const pctB = total > 0 ? Math.round((votesB / total) * 100) : 50;
    const sg: QuestionSplitGrade = splitGrade(pctA, pctB);

    // ─── Time windows for heat vs longevity ───
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const recentCutoff = new Date(now - WEEK_MS).toISOString();

    const recentEvents = eventRows.filter((e) => e.created_at >= recentCutoff);
    const recentVotes = voteRows.length; // all-time as approx (votes don't have created_at in select)
    const recentReasonEngaged = recentEvents.filter((e) => e.event_name === "reason_engaged").length;
    const recentReplies = recentEvents.filter((e) => e.event_name === "reason_reply_written").length;

    // ─── Scores ───
    const heatScore = computeHeatScore(
      recentEvents.filter((e) => e.event_name === "choice_made").length,
      recentReasonEngaged,
      recentReplies,
    );

    const longevityScore = computeLongevityScore(
      voteCount,        // all-time
      reasonEngaged,     // all-time
      replyWritten,      // all-time
    );

    // ─── Quality composite ───
    const qualityScore = computeQualityScore({
      splitScore: ss,
      reasonEngagementRate,
      replyRate,
      heatScore,
      longevityScore,
      skipRate,
      feedbackRate,
    });

    // ─── Upsert ───
    const snapshot = {
      ...emptySnapshot(questionId),
      voteCount,
      reasonCtr,
      replyRate,
      nextRate,
      splitScore: ss,
      splitGrade: sg,
      heatScore,
      longevityScore,
      skipRate,
      feedbackRate,
      reasonEngagementRate,
      qualityScore,
      timestamp: new Date().toISOString(),
    };

    const result = await upsertQuestionMetrics(snapshot);
    return result.ok;
  } catch (e) {
    console.warn("[Round] snapshot update failed:", e);
    return false;
  }
}

/** Batch update all active (surfaced) questions. Returns { total, succeeded, failed }. */
export async function updateActiveQuestionSnapshots(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  results: { questionId: string; ok: boolean }[];
}> {
  const approved = await getApprovedQuestionCandidates();
  const ids = [...SEED_QUESTIONS, ...approved].map((q) => q.id);
  const results: { questionId: string; ok: boolean }[] = [];

  for (const id of ids) {
    const ok = await updateQuestionSnapshot(id);
    results.push({ questionId: id, ok });
  }

  return {
    total: ids.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
