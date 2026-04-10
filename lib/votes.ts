import { getSupabase } from "./supabase";
import type { VoteInsert } from "./types";

/**
 * votes 테이블에 저장 시도. unique(question_id, device_id) 제약 있음.
 * 중복 시 upsert로 side를 갱신 (마지막 선택이 최종).
 * 실패해도 앱은 계속 동작.
 */
export async function saveVote(vote: VoteInsert): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb
      .from("votes")
      .upsert(vote, { onConflict: "question_id,device_id" });

    if (error) {
      console.warn("[Round] vote save failed:", error.message);
    }
  } catch (e) {
    console.warn("[Round] vote save error:", e);
  }
}
