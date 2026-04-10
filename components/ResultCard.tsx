"use client";

import { useEffect, useState } from "react";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Question } from "@/lib/types";
import AnimatedNumber from "./AnimatedNumber";

interface Props {
  question: Question;
  selectedSide: "A" | "B";
  pctA: number;
  pctB: number;
  totalVotes: number;
}

export default function ResultCard({ question, selectedSide, pctA, pctB, totalVotes }: Props) {
  const [showBar, setShowBar] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

  const myPct = selectedSide === "A" ? pctA : pctB;
  const otherPct = selectedSide === "A" ? pctB : pctA;
  const diffPct = Math.abs(myPct - otherPct);
  const isNearMiss = diffPct <= 6;
  const isMajority = myPct > 50;
  const color = CATEGORY_COLORS[question.category];

  useEffect(() => {
    requestAnimationFrame(() => setShowBar(true));
    const timer = setTimeout(() => setShowSurprise(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="animate-fadeIn px-1">
      <div className="round-panel-strong rounded-3xl px-5 py-4">
        <p className="text-sm font-bold text-white/80">
          {question.question}
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          {totalVotes.toLocaleString()}명 참여
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <ResultBar
            label={question.optionA.label}
            pct={pctA}
            showBar={showBar}
            isSelected={selectedSide === "A"}
            color={color}
          />
          <ResultBar
            label={question.optionB.label}
            pct={pctB}
            showBar={showBar}
            isSelected={selectedSide === "B"}
            color={color}
          />
        </div>

        {showSurprise && (
          <div
            className="animate-popIn mt-3 rounded-xl border px-3 py-2.5 text-center"
            style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}
          >
            {isNearMiss ? (
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-white/80">
                  {isMajority ? "⚡ 거의 반반으로 갈렸어요" : "⚡ 거의 다수 쪽이었어요"}
                </p>
                <p className="text-xs text-white/58">
                  {isMajority ? (
                    <>
                      반대쪽보다 <span style={{ color }}>{diffPct}%</span> 더 많았어요
                    </>
                  ) : (
                    <>
                      반대쪽이 단 <span style={{ color }}>{diffPct}%</span> 더 많았어요
                    </>
                  )}
                </p>
              </div>
            ) : isMajority ? (
              <p className="text-[13px] font-bold text-white/80">
                👥 <span style={{ color }}>{myPct}%</span>가 같은 선택이었어요
              </p>
            ) : (
              <p className="text-[13px] font-bold text-white/80">
                🔥 <span style={{ color }}>{myPct}%</span>의 소수 의견이었어요
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ResultBar({
  label,
  pct,
  showBar,
  isSelected,
  color,
}: {
  label: string;
  pct: number;
  showBar: boolean;
  isSelected: boolean;
  color: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div
        className="absolute inset-y-0 left-0 transition-[width] duration-[900ms]"
        style={{
          width: showBar ? `${pct}%` : "0%",
          background: isSelected
            ? `linear-gradient(90deg, ${color}40, ${color}10)`
            : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
          transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isSelected && (
            <span
              className="round-mono rounded px-1.5 py-0.5 text-[9px] font-bold"
              style={{ backgroundColor: color, color: "#041015" }}
            >
              MY
            </span>
          )}
          <span className="text-[13px] font-semibold text-white/80">{label}</span>
        </div>
        <span
          className="round-mono text-lg font-extrabold tabular-nums"
          style={{ color: isSelected ? color : "rgba(255,255,255,0.5)" }}
        >
          {showBar ? <AnimatedNumber target={pct} /> : 0}%
        </span>
      </div>
    </div>
  );
}
