"use client";

import { useEffect, useRef, useState } from "react";
import type { QuestionFeedbackReason } from "@/lib/types";
import { saveQuestionFeedback } from "@/lib/questionFeedback";
import { getDeviceId } from "@/utils/analytics";

const DISLIKE_REASONS: { value: QuestionFeedbackReason; label: string }[] = [
  { value: "too_obvious", label: "답이 너무 뻔해요" },
  { value: "too_provocative", label: "너무 자극적이에요" },
  { value: "weak_context", label: "맥락이 약해요" },
  { value: "too_similar", label: "비슷한 질문이 많아요" },
  { value: "not_interested", label: "관심 없는 주제예요" },
];

interface Props {
  questionId: string;
}

type Voted = "up" | "down" | null;

export default function QuestionFeedback({ questionId }: Props) {
  const [voted, setVoted] = useState<Voted>(null);
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Reset state when question changes
  useEffect(() => {
    setVoted(null);
    setOpen(false);
  }, [questionId]);

  const handleUp = async () => {
    if (voted) return;
    setVoted("up");
    await saveQuestionFeedback({
      question_id: questionId,
      device_id: getDeviceId(),
      reason: "liked",
    });
  };

  const handleDown = () => {
    if (voted) return;
    setOpen(true);
  };

  const handleSelectReason = async (reason: QuestionFeedbackReason) => {
    setVoted("down");
    setOpen(false);
    await saveQuestionFeedback({
      question_id: questionId,
      device_id: getDeviceId(),
      reason,
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleUp}
          disabled={voted !== null}
          aria-label="이 질문 좋아요"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition ${
            voted === "up"
              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/70"
          } disabled:cursor-default`}
        >
          👍
        </button>
        <button
          type="button"
          onClick={handleDown}
          disabled={voted !== null}
          aria-label="이 질문 별로"
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition ${
            voted === "down"
              ? "border-rose-400/40 bg-rose-400/15 text-rose-300"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/70"
          } disabled:cursor-default`}
        >
          👎
        </button>
      </div>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-t-3xl border-t border-white/10 bg-[#0c0e13] px-5 py-5 pb-safe-bottom">
            <p className="mb-4 text-sm font-bold text-white/80">이 질문이 별로인 이유</p>
            <div className="flex flex-col gap-2">
              {DISLIKE_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleSelectReason(r.value)}
                  className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/70 transition active:scale-[0.98] hover:bg-white/[0.06]"
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full text-center text-xs text-white/30"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </>
  );
}
