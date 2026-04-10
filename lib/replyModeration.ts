import { SEED_QUESTIONS } from "@/data/questions";
import { getApprovedQuestionCandidates } from "./questionCandidates";
import { getSupabaseAdmin } from "./supabaseAdmin";
import type { AdminReplyItem, ReplyTone } from "./types";

interface ReplyRow {
  id: string;
  reason_id: string;
  text: string;
  tone: ReplyTone;
  selected_option_id: string | null;
  created_at: string;
}

interface ReasonRow {
  id: string;
  question_id: string | null;
  side: "A" | "B" | null;
  text: string;
}

export async function listRecentReplies(limit = 20): Promise<AdminReplyItem[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  try {
    const { data: replies, error: repliesError } = await sb
      .from("reason_replies")
      .select("id, reason_id, text, tone, selected_option_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (repliesError || !replies) return [];

    const reasonIds = [...new Set((replies as ReplyRow[]).map((row) => row.reason_id))];
    const { data: reasons, error: reasonsError } = await sb
      .from("reasons")
      .select("id, question_id, side, text")
      .in("id", reasonIds);

    if (reasonsError || !reasons) return [];

    const approved = await getApprovedQuestionCandidates();
    const questionMap = new Map(
      [...SEED_QUESTIONS, ...approved].map((question) => [question.id, question.question]),
    );
    const reasonMap = new Map((reasons as ReasonRow[]).map((reason) => [reason.id, reason]));

    return (replies as ReplyRow[]).map((reply) => {
      const reason = reasonMap.get(reply.reason_id);
      const questionId = reason?.question_id ?? null;

      return {
        id: reply.id,
        reasonId: reply.reason_id,
        questionId,
        questionText: questionId ? questionMap.get(questionId) ?? null : null,
        reasonText: reason?.text ?? "",
        reasonSide: reason?.side ?? null,
        replyText: reply.text,
        tone: reply.tone,
        selectedOptionId: reply.selected_option_id,
        createdAt: reply.created_at,
      };
    });
  } catch {
    return [];
  }
}

export async function deleteReply(replyId: string): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY" };

  try {
    const { error } = await sb.from("reason_replies").delete().eq("id", replyId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "delete failed" };
  }
}
