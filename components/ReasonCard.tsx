"use client";

import { useState } from "react";
import type { Reason } from "@/lib/types";
import ReasonThread from "./ReasonThread";
import { trackEvent } from "@/utils/analytics";

interface Props {
  reason: Reason;
  sideLabel: string;
  color: string;
  selectedOptionId: string;
  optionALabel?: string;
  optionBLabel?: string;
  onHeart?: (id: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
  delay?: number;
  showReplies?: boolean;
}

export default function ReasonCard({
  reason, sideLabel, color, selectedOptionId, optionALabel, optionBLabel,
  onHeart, delay = 0, showReplies,
}: Props) {
  const [r, setR] = useState(reason);
  const [threadOpen, setThreadOpen] = useState(false);
  const hasId = !!r.id;

  const handleHeart = async () => {
    if (!r.id || r.likedByMe || !onHeart) return;
    setR((p) => ({ ...p, likedByMe: true, likes: p.likes + 1 }));
    trackEvent("reason_engaged", { reasonId: r.id, action: "heart" });
    const res = await onHeart(r.id);
    if (!res.ok) setR((p) => ({ ...p, likedByMe: false, likes: Math.max(0, p.likes - 1) }));
  };

  return (
    <>
      <div className="animate-fadeUp rounded-2xl border border-white/7 bg-white/[0.03] px-4 py-3" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}20`, color }}>
              {sideLabel}
            </span>
            <p className="text-[13px] leading-[1.6] text-white/74">{r.text}</p>
          </div>
          <button type="button" disabled={!hasId || r.likedByMe || !onHeart} onClick={handleHeart}
            className="round-mono mt-0.5 shrink-0 rounded-full border border-white/10 px-2 py-1 text-[11px] transition disabled:cursor-default disabled:opacity-50"
            style={{ color: r.likedByMe ? color : "rgba(255,255,255,0.4)", backgroundColor: r.likedByMe ? `${color}18` : "transparent" }}>
            ♥ {r.likes}
          </button>
        </div>

        {showReplies && hasId && (
          <button
            onClick={() => {
              setThreadOpen(true);
              trackEvent("reason_engaged", { reasonId: r.id, action: "thread_open" });
            }}
            className="mt-2 flex items-center gap-1 pl-7 text-[11px] text-white/35 hover:text-white/55"
          >
            <span>💬</span>
            <span>답글</span>
          </button>
        )}
      </div>

      {threadOpen && hasId && (
        <ReasonThread
          reason={r}
          sideLabel={sideLabel}
          color={color}
          selectedOptionId={selectedOptionId}
          optionALabel={optionALabel ?? "A"}
          optionBLabel={optionBLabel ?? "B"}
          onClose={() => setThreadOpen(false)}
          onHeart={onHeart}
        />
      )}
    </>
  );
}
