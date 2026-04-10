"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Question, Reason } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";
import QuestionFeedback from "./QuestionFeedback";
import VoicesSheet from "./VoicesSheet";

interface Props {
  question: Question;
  // pre-choice
  onChoose: (side: "A" | "B") => void;
  onSkip: () => void;
  disabled: boolean;
  selectedSide: "A" | "B" | null;
  isPending: boolean;
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
  // context
  contextHint?: string | null;
}

/**
 * Full-screen short-form question card.
 *
 * Layout:
 *   - Top:    subtle X (skip) + 👍/👎 (hidden pre-selection)
 *   - Middle: category badge + big question text (40~50% of screen)
 *   - Bottom: A/B buttons (pre-selection) OR result bars + voices CTA (post)
 *   - Footer: "↓ 다음 질문" bounce hint
 *
 * Category accent color injected via data-category attribute
 * (picked up by CSS variables in globals.css → --category-accent).
 */
export default function QuestionFeedCard({
  question,
  onChoose,
  onSkip,
  disabled,
  selectedSide,
  isPending,
  showResult,
  pctA,
  pctB,
  totalVotes,
  bestSame,
  bestOpposite,
  allReasons,
  onHeart,
  onReasonSubmit,
  contextHint,
}: Props) {
  const color = CATEGORY_COLORS[question.category];
  const sideLabel = (s: "A" | "B") =>
    s === "A" ? question.optionA.label : question.optionB.label;

  const [showBar, setShowBar] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!showResult) {
      setShowBar(false);
      return;
    }
    const t = setTimeout(() => setShowBar(true), 80);
    return () => clearTimeout(t);
  }, [showResult]);

  // close sheet when question changes
  useEffect(() => {
    setSheetOpen(false);
  }, [question.id]);

  return (
    <section
      data-category={question.category}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 20%, ${color}1a, transparent 70%),
          radial-gradient(ellipse 60% 40% at 50% 80%, ${color}12, transparent 70%),
          #06070B
        `,
      }}
    >
      {/* ─── Top bar: feedback thumbs + skip X ─── */}
      <div className="relative z-10 flex items-start justify-between px-5 pt-safe-top">
        <div className="pt-3">
          {/* Thumbs: only visible post-result (selection needed first) */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.42, duration: 0.22 }}
              >
                <QuestionFeedback questionId={question.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={onSkip}
          aria-label="건너뛰기"
          className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] text-white/25 transition hover:bg-white/[0.04] hover:text-white/65 active:scale-[0.9]"
        >
          ✕
        </button>
      </div>

      {/* ─── Middle: category badge + big question ─── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-4 text-center">
        {/* Context hint — only pre-selection, only if hint exists */}
        {contextHint && !showResult && !selectedSide && (
          <motion.p
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="round-mono mb-3 text-[11px] font-medium tracking-tight text-white/40"
          >
            {contextHint}
          </motion.p>
        )}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
          style={{
            borderColor: `${color}44`,
            backgroundColor: `${color}1a`,
            color,
          }}
        >
          <span>{question.categoryEmoji}</span>
          <span>{question.category}</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: 0.04 }}
          className="mt-5 text-balance text-[26px] font-black leading-[1.25] tracking-[-0.035em] text-white sm:text-[28px]"
          style={{ textShadow: `0 6px 40px ${color}33` }}
        >
          {question.question}
        </motion.h2>
        {totalVotes > 0 && (
          <p className="mt-4 text-[11px] text-white/35">
            {totalVotes.toLocaleString()}명 참여
          </p>
        )}
      </div>

      {/* ─── Bottom action area ─── */}
      <div className="relative z-10 px-5 pb-[calc(env(safe-area-inset-bottom,12px)+28px)]">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-3"
            >
              {(["A", "B"] as const).map((side) => {
                const opt = side === "A" ? question.optionA : question.optionB;
                const isMe = selectedSide === side;
                return (
                  <motion.button
                    key={side}
                    type="button"
                    onClick={() => onChoose(side)}
                    disabled={disabled}
                    whileTap={{ scale: 0.97 }}
                    className="relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors"
                    style={{
                      borderColor: isMe ? color : "rgba(255,255,255,0.12)",
                      background: isMe
                        ? `linear-gradient(180deg, ${color}28, ${color}10)`
                        : "rgba(20,23,34,0.85)",
                      boxShadow: isMe
                        ? `0 0 0 1px ${color}66, 0 10px 36px -10px ${color}55`
                        : "0 10px 28px -16px rgba(0,0,0,0.6)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="round-mono flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[12px] font-black"
                        style={{
                          borderColor: `${color}66`,
                          color,
                          backgroundColor: `${color}14`,
                        }}
                      >
                        {side}
                      </span>
                      <span className="text-[15px] font-bold leading-snug text-white/95">
                        {opt.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
              {isPending && (
                <div className="mt-1 text-center text-[11px] text-cyan-300/70">
                  집계 중…
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-3"
            >
              {(["A", "B"] as const).map((side) => {
                const pct = side === "A" ? pctA : pctB;
                const isMe = selectedSide === side;
                return (
                  <div
                    key={side}
                    className="relative overflow-hidden rounded-2xl border px-5 py-4"
                    style={{
                      borderColor: isMe ? color : "rgba(255,255,255,0.1)",
                      background: "rgba(20,23,34,0.85)",
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 transition-[width] duration-[600ms]"
                      style={{
                        width: showBar ? `${pct}%` : "0%",
                        background: isMe
                          ? `linear-gradient(90deg, ${color}55, ${color}12)`
                          : "linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                        transitionTimingFunction:
                          "cubic-bezier(0.2, 0.8, 0.2, 1)",
                      }}
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {isMe && (
                          <span
                            className="round-mono rounded px-1.5 py-0.5 text-[9px] font-black"
                            style={{ backgroundColor: color, color: "#041015" }}
                          >
                            MY
                          </span>
                        )}
                        <span className="truncate text-[14px] font-bold text-white/90">
                          {sideLabel(side)}
                        </span>
                      </div>
                      <span
                        className="round-mono shrink-0 text-[20px] font-black tabular-nums"
                        style={{
                          color: isMe ? color : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {showBar ? <AnimatedNumber target={pct} /> : 0}%
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Best voices preview (1 line each) */}
              {(bestSame || bestOpposite) && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.22 }}
                  className="mt-1 flex flex-col gap-1.5"
                >
                  {bestSame && (
                    <p className="truncate text-[12px] text-white/55">
                      <span className="mr-1.5 text-white/30">같은 선택</span>
                      {bestSame.text}
                    </p>
                  )}
                  {bestOpposite && (
                    <p className="truncate text-[12px] text-white/55">
                      <span className="mr-1.5 text-white/30">반대 선택</span>
                      {bestOpposite.text}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Voices sheet CTA */}
              <motion.button
                type="button"
                onClick={() => setSheetOpen(true)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.22 }}
                whileTap={{ scale: 0.98 }}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-2.5 text-[12px] font-semibold text-white/70 transition hover:bg-white/[0.08]"
              >
                💬 의견 {allReasons.length}개 보기
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* swipe hint */}
        <div className="mt-5 flex flex-col items-center">
          <span className="animate-hintBounce round-mono text-[10px] uppercase tracking-[0.32em] text-white/30">
            ↓ 다음 질문
          </span>
        </div>
      </div>

      {/* Voices bottom sheet */}
      {selectedSide && (
        <VoicesSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          bestSame={bestSame}
          bestOpposite={bestOpposite}
          allReasons={allReasons}
          categoryColor={color}
          selectedSide={selectedSide}
          optionALabel={question.optionA.label}
          optionBLabel={question.optionB.label}
          onHeart={onHeart}
          onReasonSubmit={onReasonSubmit}
        />
      )}
    </section>
  );
}
