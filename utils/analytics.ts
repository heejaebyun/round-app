import { getSupabase } from "@/lib/supabase";
import { isTossMiniApp } from "@/lib/toss";

export type EventName =
  | "card_viewed"
  | "choice_made"
  | "result_viewed"
  | "reason_viewed"        // legacy — kept for backward compat
  | "reason_impression"    // reasons rendered (passive)
  | "reason_engaged"       // user actively interacted with a reason
  | "reason_written"
  | "next_card_clicked"
  | "question_skipped"
  | "dna_profile_viewed"
  | "dna_shared"
  | "reason_reply_written"
  | "reason_reply_viewed"
  | "question_feedback"
  | "toss_login_started"
  | "toss_login_succeeded"
  | "toss_login_failed"
  | "toss_logout"
  | "choices_reset"
  | "session_start"
  | "session_end";

export type Channel = "toss" | "web";

let _channel: Channel | null = null;

function getChannel(): Channel {
  if (_channel) return _channel;
  _channel = typeof window !== "undefined" && isTossMiniApp() ? "toss" : "web";
  return _channel;
}

/**
 * 이벤트를 Supabase events 테이블에 저장.
 * 모든 이벤트에 channel (toss/web)이 자동 포함된다.
 */
export function trackEvent(name: EventName, data?: Record<string, unknown>) {
  const deviceId = getDeviceId();
  const payload = { ...data, channel: getChannel() };

  if (process.env.NODE_ENV === "development") {
    console.log(`[Round] ${name}`, payload);
  }

  const sb = getSupabase();
  if (!sb) return;

  Promise.resolve(
    sb.from("events").insert({
      device_id: deviceId,
      event_name: name,
      event_data: payload,
    }),
  )
    .then(({ error }) => {
      if (error) console.warn("[Round] event save failed:", error.message);
    })
    .catch(() => {});
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("round_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("round_device_id", id);
  }
  return id;
}

let _sessionEndRegistered = false;

/** 페이지 이탈 시 session_end 전송. 중복 등록 방지. */
export function registerSessionEnd() {
  if (typeof window === "undefined" || _sessionEndRegistered) return;
  _sessionEndRegistered = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackEvent("session_end", {
        totalTime_ms: Math.round(performance.now()),
      });
    }
  });
}
