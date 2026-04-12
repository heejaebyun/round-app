"use client";

import { useEffect, useRef, useState } from "react";
import type { QuestionFeedbackReason, QuestionLocale } from "@/lib/types";
import { clearQuestionFeedback, saveQuestionFeedback } from "@/lib/questionFeedback";
import { getDeviceId } from "@/utils/analytics";
import { isEnglishLocale } from "@/lib/i18n";

const DISLIKE_REASONS: { value: QuestionFeedbackReason; label: string }[] = [
  { value: "too_obvious", label: "답이 너무 뻔해요" },
  { value: "too_provocative", label: "너무 자극적이에요" },
  { value: "weak_context", label: "맥락이 약해요" },
  { value: "too_similar", label: "비슷한 질문이 많아요" },
  { value: "not_interested", label: "관심 없는 주제예요" },
];

interface Props {
  questionId: string;
  locale?: QuestionLocale;
}

type Voted = "up" | "down" | null;

/**
 * 👍/👎 toggle on each question.
 *
 * - 👍 click: save `liked` (no modal). Re-click clears it.
 * - 👎 click: open reason sheet. Selecting a reason saves it. Re-click
 *   after already voted down clears the vote.
 * - Switching sides (👍 → 👎 or 👎 → 👍) clears the prior side first.
 * - Modal closes on: backdrop tap, ESC, 취소 button, 👎 re-click.
 */
export default function QuestionFeedback({ questionId, locale }: Props) {
  const [voted, setVoted] = useState<Voted>(null);
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const isEn = isEnglishLocale(locale);
  const dislikeReasons = isEn
    ? [
        { value: "too_obvious" as const, label: "The answer feels too obvious" },
        { value: "too_provocative" as const, label: "It feels too provocative" },
        { value: "weak_context" as const, label: "The context feels weak" },
        { value: "too_similar" as const, label: "Too many questions like this" },
        { value: "not_interested" as const, label: "I'm not interested in this topic" },
      ]
    : DISLIKE_REASONS;

  // ESC key closes modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const deviceId = () => getDeviceId();

  const handleUp = async () => {
    // Toggle off
    if (voted === "up") {
      setVoted(null);
      await clearQuestionFeedback(questionId, deviceId());
      return;
    }
    // Switching from down → up: clear first, then save
    if (voted === "down") {
      await clearQuestionFeedback(questionId, deviceId());
    }
    setVoted("up");
    await saveQuestionFeedback({
      question_id: questionId,
      device_id: deviceId(),
      reason: "liked",
    });
  };

  const handleDown = async () => {
    // Toggle off
    if (voted === "down") {
      setVoted(null);
      setOpen(false);
      await clearQuestionFeedback(questionId, deviceId());
      return;
    }
    // If it was a like, clear first so the modal selection is clean
    if (voted === "up") {
      setVoted(null);
      await clearQuestionFeedback(questionId, deviceId());
    }
    setOpen(true);
  };

  const handleSelectReason = async (reason: QuestionFeedbackReason) => {
    setVoted("down");
    setOpen(false);
    await saveQuestionFeedback({
      question_id: questionId,
      device_id: deviceId(),
      reason,
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleUp}
          aria-label={voted === "up" ? (isEn ? "Remove like" : "좋아요 취소") : (isEn ? "Like this question" : "이 질문 좋아요")}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition ${
            voted === "up"
              ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-200"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/70"
          }`}
        >
          👍
        </button>
        <button
          type="button"
          onClick={handleDown}
          aria-label={voted === "down" ? (isEn ? "Remove dislike" : "싫어요 취소") : (isEn ? "Dislike this question" : "이 질문 별로")}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-[13px] transition ${
            voted === "down"
              ? "border-rose-400/50 bg-rose-400/20 text-rose-200"
              : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white/70"
          }`}
        >
          👎
        </button>
      </div>

      {open && (
        <div
          ref={backdropRef}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55"
          onPointerDown={(e) => {
            if (e.target === backdropRef.current) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-t-3xl border-t border-white/10 bg-[#0c0e13] px-5 py-5 pb-safe-bottom"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-white/80">
                {isEn ? "Why doesn't this question work for you?" : "이 질문이 별로인 이유"}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={isEn ? "Close" : "닫기"}
                className="text-xs text-white/35 hover:text-white/65"
              >
                {isEn ? "Close" : "닫기"}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {dislikeReasons.map((r) => (
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
              {isEn ? "Cancel" : "취소"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
