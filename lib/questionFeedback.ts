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
