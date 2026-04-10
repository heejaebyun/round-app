import { getSupabase } from "./supabase";
import type { Reason, ReasonInsert, ReasonReply, ReplyInsert, ReplyTone } from "./types";
import { getDeviceId } from "@/utils/analytics";

/**
 * reasons 테이블에 insert. 빈 문자열은 저장하지 않음.
 * 실패해도 앱은 계속 동작.
 */
export async function saveReason(reason: ReasonInsert): Promise<void> {
  if (!reason.text.trim()) return;

  const sb = getSupabase();
  if (!sb) return;

  try {
    const { error } = await sb.from("reasons").insert(reason);
    if (error) console.warn("[Round] reason save failed:", error.message);
  } catch (e) {
    console.warn("[Round] reason save error:", e);
  }
}

/**
 * 특정 질문의 실제 유저 이유를 최대 count개 가져온다.
 * 없거나 실패하면 빈 배열.
 */
export async function fetchReasons(
  questionId: string,
  count = 3,
): Promise<Reason[]> {
  const sb = getSupabase();
  if (!sb) return [];

  try {
    const { data, error } = await sb
      .from("reasons")
      .select("id, side, text, hearts")
      .eq("question_id", questionId)
      .eq("is_seed", false)
      .order("created_at", { ascending: false })
      .limit(count);

    if (error || !data) return [];

    const reasonIds = data.map((r) => r.id).filter(Boolean);
    let likedIds = new Set<string>();

    if (reasonIds.length > 0) {
      const { data: hearts } = await sb
        .from("reason_hearts")
        .select("reason_id")
        .in("reason_id", reasonIds)
        .eq("device_id", getDeviceId());

      likedIds = new Set((hearts ?? []).map((h) => h.reason_id));
    }

    return data.map((r) => ({
      id: r.id,
      side: r.side as "A" | "B",
      text: r.text,
      likes: r.hearts ?? 0,
      likedByMe: likedIds.has(r.id),
    }));
  } catch {
    return [];
  }
}

/**
 * 특정 이유에 공감(하트) 1회 추가.
 * 이미 누른 경우 중복 insert는 무시하고 liked 상태로 간주한다.
 */
export async function heartReason(reasonId: string): Promise<{
  ok: boolean;
  alreadyLiked?: boolean;
}> {
  const sb = getSupabase();
  if (!sb) return { ok: false };

  const deviceId = getDeviceId();

  try {
    const { error: insertError } = await sb.from("reason_hearts").insert({
      reason_id: reasonId,
      device_id: deviceId,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: true, alreadyLiked: true };
      }
      console.warn("[Round] reason heart insert failed:", insertError.message);
      return { ok: false };
    }

    // hearts 카운트 증가 — reason_hearts 테이블의 count를 직접 세는 방식으로
    // 레이스 컨디션 없이 정확한 값 유지
    const { count } = await sb
      .from("reason_hearts")
      .select("*", { count: "exact", head: true })
      .eq("reason_id", reasonId);

    await sb.from("reasons").update({ hearts: count ?? 1 }).eq("id", reasonId);

    return { ok: true };
  } catch (e) {
    console.warn("[Round] reason heart error:", e);
    return { ok: false };
  }
}

// --- Replies ---

export async function saveReply(reply: ReplyInsert): Promise<{ ok: boolean }> {
  const sb = getSupabase();
  if (!sb) return { ok: false };
  try {
    const { error } = await sb.from("reason_replies").insert(reply);
    if (error) { console.warn("[Round] reply save failed:", error.message); return { ok: false }; }
    return { ok: true };
  } catch { return { ok: false }; }
}

export async function fetchReplies(
  reasonId: string,
  limit = 5,
): Promise<ReasonReply[]> {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb
      .from("reason_replies")
      .select("id, reason_id, device_id, text, tone, selected_option_id, likes, created_at")
      .eq("reason_id", reasonId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      reasonId: r.reason_id,
      deviceId: r.device_id,
      text: r.text,
      tone: r.tone as ReplyTone,
      selectedOptionId: r.selected_option_id ?? null,
      likes: r.likes ?? 0,
      createdAt: r.created_at,
    }));
  } catch { return []; }
}
