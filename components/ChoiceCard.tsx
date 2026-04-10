"use client";

import { CATEGORY_COLORS } from "@/lib/constants";
import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  onChoose: (side: "A" | "B") => void;
  disabled: boolean;
  selectedSide?: "A" | "B" | null;
  isPendingResult?: boolean;
}

export default function ChoiceCard({
  question,
  onChoose,
  disabled,
  selectedSide = null,
  isPendingResult = false,
}: Props) {
  const color = CATEGORY_COLORS[question.category];
  const isImage = question.displayType === "image";

  return (
    <section className="animate-slideIn px-1">
      <div className="round-panel-strong relative overflow-hidden rounded-3xl px-5 py-5">
        {/* 카테고리 배지 */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
          style={{ borderColor: `${color}33`, backgroundColor: `${color}14`, color }}
        >
          <span>{question.categoryEmoji}</span>
          <span>{question.category}</span>
        </div>

        {/* 질문 */}
        <h2
          className={`mt-4 font-bold leading-snug tracking-[-0.02em] text-white ${
            isImage ? "text-base" : "text-lg"
          }`}
        >
          {question.question}
        </h2>

        {/* 선택지 */}
        {isImage ? (
          <div className="mt-5 flex gap-3">
            {(["A", "B"] as const).map((side) => {
              const opt = side === "A" ? question.optionA : question.optionB;
              return (
                <button
                  key={side}
                  onClick={() => onChoose(side)}
                  disabled={disabled}
                  className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <div
                    className="aspect-[4/5] w-full bg-cover bg-center"
                    style={{
                      backgroundImage: opt.img ? `url(${opt.img})` : undefined,
                      backgroundColor: opt.img ? undefined : "rgba(255,255,255,0.05)",
                    }}
                  />
                  <div className="px-3 py-2.5 text-center text-sm font-bold text-white/90">
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {(["A", "B"] as const).map((side) => {
              const opt = side === "A" ? question.optionA : question.optionB;
              return (
                <button
                  key={side}
                  onClick={() => onChoose(side)}
                  disabled={disabled}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-all active:scale-[0.985] disabled:opacity-100"
                  style={
                    selectedSide === side
                      ? {
                          borderColor: `${color}55`,
                          backgroundColor: `${color}12`,
                          boxShadow: `inset 0 0 0 1px ${color}33`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="round-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold"
                      style={{
                        borderColor: `${color}33`,
                        color,
                        backgroundColor: selectedSide === side ? `${color}18` : undefined,
                      }}
                    >
                      {side}
                    </span>
                    <span className="text-sm font-bold text-white/90">{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isPendingResult && selectedSide && (
          <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
            <p className="round-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/72">
              집계 중
            </p>
            <p className="mt-1 text-sm font-semibold text-white/76">
              다른 사람들은 어느 쪽이 더 많을까요?
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
