"use client";

import type { UserChoice } from "@/lib/types";
import { buildActivitySentences, computeActivityStats } from "@/lib/userActivity";

interface Props {
  choices: UserChoice[];
}

/**
 * 실측 기반 최근 7일 활동 요약 카드.
 * 여기엔 로그로 역산 가능한 문장만 들어간다 (dwell time / scroll depth 금지).
 */
export default function ActivitySummary({ choices }: Props) {
  const stats = computeActivityStats(choices);
  const lines = buildActivitySentences(stats);

  return (
    <section className="round-panel-strong rounded-[30px] px-5 py-5">
      <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-cyan-200/70">
        Last 7 Days
      </p>
      <p className="mt-2 text-sm font-bold text-white/80">최근 내 선택 기록</p>
      <ul className="mt-4 flex flex-col gap-2">
        {lines.map((line, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] leading-relaxed text-white/70"
          >
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-cyan-300/60" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {stats.totalLast7d > 0 && stats.categoryBreakdownLast7d.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {stats.categoryBreakdownLast7d.map((item) => (
            <span
              key={item.category}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-white/55"
            >
              {item.category} <span className="round-mono text-white/35">{item.count}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
