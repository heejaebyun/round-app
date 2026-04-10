"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Reason, ReasonReply, ReplyTone } from "@/lib/types";
import { fetchReplies, saveReply } from "@/lib/reasons";
import { getDeviceId, trackEvent } from "@/utils/analytics";

type FilterKey = "all" | "same" | "opposite";

interface Props {
  reason: Reason;
  sideLabel: string;
  color: string;
  selectedOptionId: string;
  optionALabel: string;
  optionBLabel: string;
  onClose: () => void;
  onHeart?: (id: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
}

export default function ReasonThread({
  reason, sideLabel, color, selectedOptionId,
  optionALabel, optionBLabel, onClose, onHeart,
}: Props) {
  const [replies, setReplies] = useState<ReasonReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replyTone, setReplyTone] = useState<ReplyTone>("comment");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [r, setR] = useState(reason);
  const backdropRef = useRef<HTMLDivElement>(null);

  const oppositeSide = selectedOptionId === "A" ? "B" : "A";
  const optionLabel = (id: string | null) => id === "A" ? optionALabel : id === "B" ? optionBLabel : "";

  useEffect(() => {
    if (!reason.id) return;
    let cancelled = false;
    fetchReplies(reason.id, 50).then((data) => { if (!cancelled) setReplies(data); });
    trackEvent("reason_reply_viewed", { reasonId: reason.id });
    return () => { cancelled = true; };
  }, [reason.id]);

  const filtered = useMemo(() => {
    if (filter === "all") return replies;
    if (filter === "same") return replies.filter((rep) => rep.selectedOptionId === selectedOptionId);
    return replies.filter((rep) => rep.selectedOptionId === oppositeSide);
  }, [replies, filter, selectedOptionId, oppositeSide]);

  const sameCount = replies.filter((rep) => rep.selectedOptionId === selectedOptionId).length;
  const oppositeCount = replies.filter((rep) => rep.selectedOptionId === oppositeSide).length;

  const handleReply = async () => {
    if (!replyText.trim() || !reason.id) return;
    const deviceId = getDeviceId();
    const text = replyText.trim();
    setReplies((prev) => [
      ...prev,
      { id: "", reasonId: reason.id!, deviceId, text, tone: replyTone, selectedOptionId, likes: 0, createdAt: new Date().toISOString() },
    ]);
    setReplyText("");
    saveReply({ reason_id: reason.id, device_id: deviceId, text, tone: replyTone, selected_option_id: selectedOptionId });
    trackEvent("reason_reply_written", { reasonId: reason.id, tone: replyTone, selectedOptionId });
  };

  const handleHeart = async () => {
    if (!r.id || r.likedByMe || !onHeart) return;
    setR((p) => ({ ...p, likedByMe: true, likes: p.likes + 1 }));
    const res = await onHeart(r.id);
    if (!res.ok) setR((p) => ({ ...p, likedByMe: false, likes: Math.max(0, p.likes - 1) }));
  };

  return (
    <div ref={backdropRef} className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}>
      <div className="no-scrollbar flex max-h-[85vh] flex-col overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0c0e13]">

        {/* 헤더 */}
        <div className="sticky top-0 z-10 border-b border-white/8 bg-[#0c0e13] px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/80">스레드</p>
            <button onClick={onClose} className="text-xs text-white/40">닫기</button>
          </div>
        </div>

        {/* 루트 이유 */}
        <div className="border-b border-white/6 px-5 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}20`, color }}>
                {sideLabel}
              </span>
              <p className="text-sm leading-relaxed text-white/80">{r.text}</p>
            </div>
            <button type="button" disabled={!r.id || r.likedByMe || !onHeart} onClick={handleHeart}
              className="round-mono shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] disabled:cursor-default disabled:opacity-50"
              style={{ color: r.likedByMe ? color : "rgba(255,255,255,0.4)", backgroundColor: r.likedByMe ? `${color}18` : "transparent" }}>
              ♥ {r.likes}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-white/25">{replies.length}개 답글</p>
        </div>

        {/* 필터 */}
        {replies.length > 0 && (
          <div className="flex gap-1.5 border-b border-white/6 px-5 py-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={`전체 ${replies.length}`} />
            <FilterChip active={filter === "same"} onClick={() => setFilter("same")} label={`${optionLabel(selectedOptionId)} ${sameCount}`} />
            <FilterChip active={filter === "opposite"} onClick={() => setFilter("opposite")} label={`${optionLabel(oppositeSide)} ${oppositeCount}`} />
          </div>
        )}

        {/* 답글 목록 */}
        <div className="flex-1 px-5 py-3">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/25">
              {filter === "all" ? "아직 답글이 없어요" : `${filter === "same" ? "같은 쪽" : "반대쪽"} 답글이 아직 없어요`}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((rep, i) => (
                <div key={rep.id || `${rep.text}-${i}`} className="rounded-xl bg-white/[0.03] px-3.5 py-2.5">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    {/* 선택 옵션 라벨 */}
                    {rep.selectedOptionId && (
                      <span className="rounded px-1.5 py-0.5 font-bold"
                        style={{
                          backgroundColor: rep.selectedOptionId === selectedOptionId ? `${color}15` : "rgba(255,255,255,0.06)",
                          color: rep.selectedOptionId === selectedOptionId ? color : "rgba(255,255,255,0.4)",
                        }}>
                        {optionLabel(rep.selectedOptionId)}
                      </span>
                    )}
                    {/* 톤 */}
                    {rep.tone !== "comment" && (
                      <span className="font-bold" style={{ color: rep.tone === "agree" ? "#34d399" : "#f87171" }}>
                        {rep.tone === "agree" ? "동의" : "반박"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/65">{rep.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 입력 */}
        <div className="sticky bottom-0 border-t border-white/8 bg-[#0c0e13] px-4 py-3 pb-safe-bottom">
          <div className="mb-2 flex items-center gap-1.5">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}15`, color }}>
              {optionLabel(selectedOptionId)}
            </span>
            {(["agree", "rebuttal", "comment"] as const).map((t) => (
              <button key={t} onClick={() => setReplyTone(t)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition ${replyTone === t ? "bg-white/15 text-white/70" : "text-white/25"}`}>
                {t === "agree" ? "동의" : t === "rebuttal" ? "반박" : "댓글"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value.slice(0, 80))}
              onKeyDown={(e) => e.key === "Enter" && handleReply()}
              placeholder="한마디..."
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white/80 placeholder-white/25 outline-none" />
            <button onClick={handleReply} disabled={!replyText.trim()}
              className="shrink-0 rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white/60 disabled:opacity-30">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${active ? "bg-white/12 text-white/70" : "text-white/30"}`}>
      {label}
    </button>
  );
}
