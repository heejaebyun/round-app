"use client";

import type { QuestionLocale, UserChoice } from "@/lib/types";
import { buildActivitySentences, computeActivityStats } from "@/lib/userActivity";
import { isEnglishLocale } from "@/lib/i18n";

interface Props {
  choices: UserChoice[];
  locale?: QuestionLocale;
}

/**
 * Measured last-7-day activity summary card.
 * Only log-backed sentences — no dwell time / scroll depth guesses.
 */
export default function ActivitySummary({ choices, locale }: Props) {
  const isEn = isEnglishLocale(locale);
  const stats = computeActivityStats(choices);
  const lines = buildActivitySentences(stats, locale);

  return (
    <section className="round-panel-strong rounded-[30px] px-5 py-5">
      <p className="round-mono text-[11px] uppercase tracking-[0.26em] text-cyan-200/70">
        Last 7 Days
      </p>
      <p className="mt-2 text-sm font-bold text-white/80">
        {isEn ? "Recent activity" : "최근 내 선택 기록"}
      </p>
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
