"use client";

import { useRef, useState } from "react";
import type { QuestionFeedbackReason } from "@/lib/types";
import { saveQuestionFeedback } from "@/lib/questionFeedback";
import { getDeviceId } from "@/utils/analytics";

const REASONS: { value: QuestionFeedbackReason; label: string }[] = [
  { value: "too_obvious", label: "답이 너무 뻔해요" },
  { value: "too_provocative", label: "너무 자극적이에요" },
  { value: "weak_context", label: "맥락이 약해요" },
  { value: "too_similar", label: "비슷한 질문이 많아요" },
  { value: "not_interested", label: "관심 없는 주제예요" },
];

interface Props {
  questionId: string;
}

export default function QuestionFeedback({ questionId }: Props) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSelect = async (reason: QuestionFeedbackReason) => {
    setSent(true);
    setOpen(false);
    await saveQuestionFeedback({
      question_id: questionId,
      device_id: getDeviceId(),
      reason,
    });
  };

  if (sent) {
    return (
      <p className="text-center text-[11px] text-white/25">피드백 감사합니다</p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-white/20 hover:text-white/40"
      >
        질문 별로예요
      </button>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-t-3xl border-t border-white/10 bg-[#0c0e13] px-5 py-5 pb-safe-bottom">
            <p className="mb-4 text-sm font-bold text-white/80">이 질문이 별로인 이유</p>
            <div className="flex flex-col gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleSelect(r.value)}
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
