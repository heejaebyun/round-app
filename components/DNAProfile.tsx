"use client";

import { useState } from "react";
import type { Category, ChoiceDNA, UserChoice } from "@/lib/types";
import { buildDNAShareUrl, SHARE_MIN_CHOICES } from "@/lib/share";
import { SITE } from "@/lib/site";
import { trackEvent } from "@/utils/analytics";
import { getAxisInterpretation, getTagInterpretation, generateSummaryLine } from "@/utils/dnaCalculator";
import { computeTodayTrace } from "@/lib/userActivity";
import ActivitySummary from "./ActivitySummary";

interface Props {
  dna: ChoiceDNA;
  progressMessage: string;
  choices: UserChoice[];
  onResetChoices: () => void;
}

const AXIS_LABELS: Record<string, [string, string]> = {
  Action: ["계획", "즉흥"],
  Reward: ["소비", "저축"],
  Relation: ["독립", "교감"],
  Motivation: ["안정", "도전"],
};

export default function DNAProfile({ dna, progressMessage, choices, onResetChoices }: Props) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [deepDive, setDeepDive] = useState(false);
  const topTags = Object.entries(dna.tags).sort(([, a], [, b]) => b - a).slice(0, 3);
  const summaryLine = generateSummaryLine(dna.archetype, dna.topTag, dna.scores);

  async function handleShare() {
    if (dna.totalChoices < SHARE_MIN_CHOICES) return;

    // Top category — same-day top, fall back to overall top from choices
    const trace = computeTodayTrace(choices);
    let topCategory: Category | null = trace.topCategory?.category ?? null;
    if (!topCategory && choices.length > 0) {
      const counts = new Map<Category, number>();
      for (const c of choices) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
      topCategory = top ? top[0] : null;
    }

    // Most extreme axis label
    const axisEntries = Object.entries(dna.scores) as [keyof typeof dna.scores, number][];
    let topAxisLabel: string | null = null;
    if (axisEntries.length > 0) {
      const [topAxis, topScore] = axisEntries.reduce((a, b) =>
        Math.abs(b[1] - 50) > Math.abs(a[1] - 50) ? b : a,
      );
      const labels = AXIS_LABELS[topAxis];
      if (labels) topAxisLabel = topScore <= 50 ? labels[0] : labels[1];
    }

    const url = buildDNAShareUrl(SITE.url, dna, { topCategory, topAxisLabel });
    if (!url) return;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: dna.fullTitle, text: `나는 "${dna.fullTitle}"`, url });
        trackEvent("dna_shared", { shareTarget: "native" });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      trackEvent("dna_shared", { shareTarget: "clipboard" });
      setTimeout(() => setShareState("idle"), 1800);
    } catch {}
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      {/* 1. 최근 7일 실측 활동 요약 (맨 위) */}
      <ActivitySummary choices={choices} />

      {/* 2. 4축 점수 */}
      <section className="round-panel rounded-[30px] px-5 py-5">
        <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-white/35">4 Axes</p>
        <div className="mt-4 flex flex-col gap-3">
          {(Object.entries(dna.scores) as [string, number][]).map(([axis, score]) => {
            const [lo, hi] = AXIS_LABELS[axis] || [axis, axis];
            return (
              <div key={axis}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-white/50">{lo}</span>
                  <span className="round-mono font-bold text-white/70">{score}</span>
                  <span className="text-white/50">{hi}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 transition-all duration-500" style={{ width: `${score}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 태그 */}
      {topTags.length > 0 && (
        <section className="round-panel rounded-[30px] px-5 py-5">
          <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-white/35">Tags</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
                #{tag} <span className="round-mono text-white/35">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 총 선택 */}
      <div className="round-panel rounded-3xl p-4 text-center">
        <p className="text-xs text-white/40">총 선택</p>
        <p className="round-mono mt-2 text-2xl font-extrabold text-white/84">{dna.totalChoices}회</p>
      </div>

      {/* 5. DNA 라벨 배지 (맨 아래, 요약 배지) */}
      <section className="round-panel-strong overflow-hidden rounded-[30px] px-5 py-5">
        <p className="round-mono text-[11px] uppercase tracking-[0.3em] text-cyan-200/60">
          이번 주의 요약 라벨
        </p>
        {dna.topTag && (
          <p className="mt-3 text-sm font-semibold text-cyan-300/80">#{dna.topTag}</p>
        )}
        <h2 className="mt-1 text-xl font-black leading-tight tracking-[-0.03em] text-white">
          {dna.archetype}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-white/55">
          {dna.archetypeDescription}
        </p>
        {dna.totalChoices >= 4 && (
          <p className="mt-3 rounded-[14px] border border-white/8 bg-white/[0.03] px-3 py-2.5 text-[12px] leading-relaxed text-white/55">
            {summaryLine}
          </p>
        )}
      </section>

      {/* 심화 보기 CTA */}
      {/* TODO: reward ad gate candidate — 향후 리워드 광고 삽입 포인트 */}
      {dna.totalChoices >= 4 && !deepDive && (
        <button
          onClick={() => { setDeepDive(true); trackEvent("dna_profile_viewed", { section: "deep_dive" }); }}
          className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/[0.06] py-3.5 text-center text-sm font-semibold text-cyan-200/80 transition hover:bg-cyan-300/10"
        >
          내 선택 패턴 더 보기 →
        </button>
      )}

      {/* 심화 보기 영역 */}
      {deepDive && (
        <section className="animate-fadeUp round-panel rounded-[30px] px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-white/35">Deep Dive</p>
            <button onClick={() => setDeepDive(false)} className="text-xs text-white/35 hover:text-white/55">접기</button>
          </div>

          {/* 축별 해석 */}
          <div className="flex flex-col gap-4">
            {(Object.entries(dna.scores) as [string, number][]).map(([axis, score]) => {
              const [lo, hi] = AXIS_LABELS[axis] || [axis, axis];
              const interp = getAxisInterpretation(axis, score);
              return (
                <div key={axis} className="rounded-[18px] border border-white/7 bg-white/[0.02] px-4 py-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-white/60">{lo} ↔ {hi}</span>
                    <span className="round-mono text-[11px] text-white/35">{score}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/55">{interp}</p>
                </div>
              );
            })}
          </div>

          {/* 태그 해석 */}
          {topTags.length > 0 && (
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-xs font-semibold text-white/45">태그 해석</p>
              {topTags.map(([tag]) => {
                const interp = getTagInterpretation(tag);
                if (!interp) return null;
                return (
                  <div key={tag} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-cyan-300/70">#{tag}</span>
                    <p className="text-[13px] leading-relaxed text-white/50">{interp}</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {progressMessage && (
        <div className="rounded-[26px] border border-cyan-300/18 bg-cyan-300/[0.07] px-4 py-4 text-center text-sm leading-6 text-cyan-100/80">
          {progressMessage}
        </div>
      )}

      {/* 공유 */}
      <button type="button" onClick={handleShare} disabled={dna.totalChoices < 10}
        className="rounded-3xl border border-white/10 bg-white px-5 py-4 text-sm font-bold text-slate-900 disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/38">
        {dna.totalChoices < 10 ? "10개 선택하면 공유할 수 있어요" : shareState === "copied" ? "링크가 복사됐어요" : "결과 공유하기"}
      </button>

      <button
        type="button"
        onClick={onResetChoices}
        className="text-sm font-semibold text-white/42 transition hover:text-white/68"
      >
        내 선택 기록 삭제
      </button>
    </div>
  );
}
