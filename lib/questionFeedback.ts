import { getSupabase } from "./supabase";
import type { QuestionFeedbackInsert } from "./types";
import { trackEvent } from "@/utils/analytics";

/**
 * Save question quality feedback to DB + analytics.
 * Best-effort: does not block UI on failure.
 */
export async function saveQuestionFeedback(feedback: QuestionFeedbackInsert): Promise<{ ok: boolean }> {
  trackEvent("question_feedback", {
    questionId: feedback.question_id,
    reason: feedback.reason,
  });

  const sb = getSupabase();
  if (!sb) return { ok: false };

  try {
    const { error } = await sb.from("question_feedback").insert(feedback);
    if (error) {
      console.warn("[Round] question feedback save failed:", error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/**
 * Delete all feedback rows for this (question, device) pair.
 * Used when a user toggles their 👍 / 👎 off.
 */
export async function clearQuestionFeedback(
  questionId: string,
  deviceId: string,
): Promise<{ ok: boolean }> {
  trackEvent("question_feedback_cleared", { questionId });

  const sb = getSupabase();
  if (!sb) return { ok: false };

  try {
    const { error } = await sb
      .from("question_feedback")
      .delete()
      .eq("question_id", questionId)
      .eq("device_id", deviceId);
    if (error) {
      console.warn("[Round] question feedback clear failed:", error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
