import type { Category, UserChoice } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** 오늘(local midnight 이후)의 선택만 추출한 요약 — 피드 상단 미니 칩용 */
export interface TodayTrace {
  count: number;
  topCategory: { category: Category; count: number } | null;
}

export function computeTodayTrace(choices: UserChoice[]): TodayTrace {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const today = choices.filter((c) => {
    const t = c.chosenAt instanceof Date ? c.chosenAt.getTime() : new Date(c.chosenAt).getTime();
    return Number.isFinite(t) && t >= midnight;
  });

  if (today.length === 0) return { count: 0, topCategory: null };

  const counts = new Map<Category, number>();
  for (const c of today) counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
  const top = Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)[0];

  return { count: today.length, topCategory: top ?? null };
}

export interface ActivityStats {
  /** 총 응답 수 (전체 기간) */
  totalAll: number;
  /** 지난 7일 응답 수 */
  totalLast7d: number;
  /** 지난 7일 가장 많이 고른 카테고리 (null이면 응답 없음) */
  topCategoryLast7d: { category: Category; count: number } | null;
  /** 지난 7일 카테고리별 응답 수 (상위만) */
  categoryBreakdownLast7d: Array<{ category: Category; count: number }>;
  /** 지난 7일 A 비율 (%) */
  sideARatioLast7d: number | null;
  /** 지난 7일 B 비율 (%) */
  sideBRatioLast7d: number | null;
  /** 지난 7일 댓글(reason) 남긴 수 */
  reasonsLast7d: number;
}

/**
 * UserChoice[] → 실측 활동 통계.
 *
 * 원칙: dwell time / scroll depth / engagement 등 아직 로그가 없는 축은
 * 건드리지 않는다. 여기서 계산하는 건 전부 로컬 기록으로 역산 가능한 값뿐.
 */
export function computeActivityStats(choices: UserChoice[]): ActivityStats {
  const now = Date.now();
  const cutoff = now - 7 * DAY_MS;

  // chosenAt이 JSON.parse 후 string일 수 있으니 보정
  const last7d = choices.filter((c) => {
    const t = c.chosenAt instanceof Date ? c.chosenAt.getTime() : new Date(c.chosenAt).getTime();
    return Number.isFinite(t) && t >= cutoff;
  });

  // Category counts
  const categoryCounts = new Map<Category, number>();
  let sideA = 0;
  let sideB = 0;
  let reasonsCount = 0;

  for (const c of last7d) {
    categoryCounts.set(c.category, (categoryCounts.get(c.category) ?? 0) + 1);
    if (c.side === "A") sideA++;
    else if (c.side === "B") sideB++;
    if (c.reason && c.reason.trim().length > 0) reasonsCount++;
  }

  const breakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const topCategory = breakdown[0] ?? null;

  const totalSides = sideA + sideB;
  const sideARatio = totalSides > 0 ? Math.round((sideA / totalSides) * 100) : null;
  const sideBRatio = totalSides > 0 ? 100 - (sideARatio ?? 0) : null;

  return {
    totalAll: choices.length,
    totalLast7d: last7d.length,
    topCategoryLast7d: topCategory,
    categoryBreakdownLast7d: breakdown.slice(0, 3),
    sideARatioLast7d: sideARatio,
    sideBRatioLast7d: sideBRatio,
    reasonsLast7d: reasonsCount,
  };
}

/**
 * 활동 통계 → 사용자에게 보여줄 서술형 문장 목록.
 * 데이터 부족한 축은 그냥 건너뜀 (거짓말하지 않는다).
 */
export function buildActivitySentences(stats: ActivityStats): string[] {
  const lines: string[] = [];

  if (stats.totalLast7d === 0) {
    return ["지난 7일 동안 쌓인 선택이 없어요"];
  }

  lines.push(`지난 7일 동안 ${stats.totalLast7d}개의 질문에 답했어요`);

  if (stats.topCategoryLast7d && stats.topCategoryLast7d.count >= 2) {
    lines.push(`가장 많이 고른 주제는 ${stats.topCategoryLast7d.category}예요`);
  }

  if (stats.sideARatioLast7d !== null && stats.totalLast7d >= 3) {
    const dominant = (stats.sideARatioLast7d ?? 0) >= 50 ? "A" : "B";
    const pct = dominant === "A" ? stats.sideARatioLast7d : stats.sideBRatioLast7d;
    lines.push(`${pct}%의 선택에서 ${dominant}쪽을 골랐어요`);
  }

  if (stats.reasonsLast7d >= 1) {
    lines.push(`직접 남긴 의견이 ${stats.reasonsLast7d}개예요`);
  }

  return lines;
}
