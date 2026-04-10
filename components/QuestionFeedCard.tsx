"use client";

import { useState, useEffect } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Question, Reason } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";
import ReasonList from "./ReasonList";
import ReasonInput from "./ReasonInput";
import QuestionFeedback from "./QuestionFeedback";

interface Props {
  question: Question;
  // pre-choice
  onChoose: (side: "A" | "B") => void;
  onSkip: () => void;
  disabled: boolean;
  selectedSide: "A" | "B" | null;
  isPending: boolean; // selected but result not ready
  // post-choice result
  showResult: boolean;
  pctA: number;
  pctB: number;
  totalVotes: number;
  // reasons
  bestSame: Reason | null;
  bestOpposite: Reason | null;
  allReasons: Reason[];
  onHeart?: (id: string) => Promise<{ ok: boolean; alreadyLiked?: boolean }>;
  onReasonSubmit: (text: string) => void;
  // next
  showNext: boolean;
  onNext: () => void;
}

export default function QuestionFeedCard({
  question, onChoose, onSkip, disabled, selectedSide, isPending,
  showResult, pctA, pctB, totalVotes,
  bestSame, bestOpposite, allReasons, onHeart, onReasonSubmit,
  showNext, onNext,
}: Props) {
  const color = CATEGORY_COLORS[question.category];
  const isImage = question.displayType === "image";
  const sideLabel = (s: "A" | "B") => s === "A" ? question.optionA.label : question.optionB.label;

  // result animation — only set when showResult transitions to true
  const [showBar, setShowBar] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

  useEffect(() => {
    if (!showResult) return;
    requestAnimationFrame(() => setShowBar(true));
    const t = setTimeout(() => setShowSurprise(true), 900);
    return () => clearTimeout(t);
  }, [showResult]);

  const myPct = selectedSide === "A" ? pctA : pctB;
  const otherPct = selectedSide === "A" ? pctB : pctA;
  const diffPct = Math.abs(myPct - otherPct);
  const isNearMiss = diffPct <= 6;
  const isMajority = myPct > 50;

  return (
    <section className="px-1">
      <div className="round-panel-strong relative overflow-hidden rounded-3xl">
        {/* ─── 상단: 카테고리 + 질문 (항상 보임) ─── */}
        <div className="px-5 pt-5 pb-1">
          <div className="flex items-center justify-between gap-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{ borderColor: `${color}33`, backgroundColor: `${color}14`, color }}
            >
              <span>{question.categoryEmoji}</span>
              <span>{question.category}</span>
            </div>
            <QuestionFeedback questionId={question.id} />
          </div>
          <h2 className={`mt-3 font-bold leading-snug tracking-[-0.02em] text-white ${isImage ? "text-base" : "text-lg"}`}>
            {question.question}
          </h2>
        </div>

        {/* ─── 선택지 (결과 나오기 전) ─── */}
        {!showResult && (
          <div className="px-5 pb-5">
            {isImage ? (
              <div className="mt-4 flex gap-3">
                {(["A", "B"] as const).map((side) => {
                  const opt = side === "A" ? question.optionA : question.optionB;
                  return (
                    <button key={side} onClick={() => onChoose(side)} disabled={disabled}
                      className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all active:scale-[0.97] disabled:opacity-100"
                      style={selectedSide === side ? { borderColor: `${color}55`, backgroundColor: `${color}12` } : undefined}>
                      <div className="aspect-[4/5] w-full bg-cover bg-center"
                        style={{ backgroundImage: opt.img ? `url(${opt.img})` : undefined, backgroundColor: opt.img ? undefined : "rgba(255,255,255,0.05)" }} />
                      <div className="px-3 py-2.5 text-center text-sm font-bold text-white/90">{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {(["A", "B"] as const).map((side) => {
                  const opt = side === "A" ? question.optionA : question.optionB;
                  return (
                    <button key={side} onClick={() => onChoose(side)} disabled={disabled}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-left transition-all active:scale-[0.985] disabled:opacity-100"
                      style={selectedSide === side ? { borderColor: `${color}55`, backgroundColor: `${color}12` } : undefined}>
                      <div className="flex items-center gap-3">
                        <span className="round-mono flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold"
                          style={{ borderColor: `${color}33`, color }}>{side}</span>
                        <span className="text-sm font-bold text-white/90">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 집계 중 (pending) */}
            {isPending && selectedSide && (
              <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-2.5">
                <p className="round-mono text-[11px] text-cyan-300/70">집계 중...</p>
              </div>
            )}

            {/* 건너뛰기 (선택 전에만) */}
            {!isPending && !selectedSide && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-[11px] text-white/30 transition hover:text-white/55"
                >
                  건너뛰기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── 결과 (확장된 상태) ─── */}
        {showResult && selectedSide && (
          <div className="animate-fadeIn px-5 pb-5">
            {/* 참여 수 */}
            <p className="mt-2 text-[11px] text-white/30">{totalVotes.toLocaleString()}명 참여</p>

            {/* 결과 바 */}
            <div className="mt-3 flex flex-col gap-2">
              {(["A", "B"] as const).map((side) => {
                const pct = side === "A" ? pctA : pctB;
                const isSelected = selectedSide === side;
                return (
                  <div key={side} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
                    <div className="absolute inset-y-0 left-0 transition-[width] duration-[900ms]"
                      style={{
                        width: showBar ? `${pct}%` : "0%",
                        background: isSelected ? `linear-gradient(90deg, ${color}40, ${color}10)` : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      }} />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isSelected && <span className="round-mono rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ backgroundColor: color, color: "#041015" }}>MY</span>}
                        <span className="text-[13px] font-semibold text-white/80">{sideLabel(side)}</span>
                      </div>
                      <span className="round-mono text-lg font-extrabold tabular-nums" style={{ color: isSelected ? color : "rgba(255,255,255,0.5)" }}>
                        {showBar ? <AnimatedNumber target={pct} /> : 0}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 서프라이즈 */}
            {showSurprise && (
              <div className="animate-popIn mt-3 rounded-xl border px-3 py-2 text-center" style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}>
                {isNearMiss ? (
                  <p className="text-[13px] font-bold text-white/80">
                    ⚡ {isMajority ? "거의 반반" : "거의 다수 쪽이었어요"} · <span style={{ color }}>{diffPct}%</span> 차이
                  </p>
                ) : isMajority ? (
                  <p className="text-[13px] font-bold text-white/80">👥 <span style={{ color }}>{myPct}%</span>가 같은 선택</p>
                ) : (
                  <p className="text-[13px] font-bold text-white/80">🔥 <span style={{ color }}>{myPct}%</span>의 소수파</p>
                )}
              </div>
            )}

            {/* 구분선 */}
            <div className="my-4 h-px bg-white/8" />

            {/* 이유 영역 — 카드 안에 포함 */}
            <ReasonList
              bestSame={bestSame}
              bestOpposite={bestOpposite}
              allReasons={allReasons}
              categoryColor={color}
              selectedSide={selectedSide}
              optionALabel={question.optionA.label}
              optionBLabel={question.optionB.label}
              onHeart={onHeart}
              embedded
            />

            {/* 이유 입력 */}
            <div className="mt-3">
              <ReasonInput onSubmit={onReasonSubmit} />
            </div>

            {/* 다음 질문 */}
            {showNext && (
              <div className="animate-fadeUp mt-4">
                <button type="button" onClick={onNext}
                  className="w-full rounded-2xl border border-white/10 bg-white/90 py-3.5 text-sm font-bold text-slate-900 transition-transform active:scale-[0.985]">
                  다음 질문
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
