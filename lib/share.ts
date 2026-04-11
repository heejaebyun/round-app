import { SITE } from "@/lib/site";
import type { ChoiceDNA } from "@/lib/types";

/** Minimum choices required before a DNA is considered shareable. */
export const SHARE_MIN_CHOICES = 10;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function safeText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 32) : fallback;
}

export interface DNAShareExtras {
  /** 최근 활동에서 가장 많이 고른 카테고리 (없으면 null) */
  topCategory?: string | null;
  /** 가장 극단으로 치우친 축의 한국어 라벨 (예: "독립", "계획", "도전") */
  topAxisLabel?: string | null;
}

/**
 * Build a shareable /dna/share URL. Returns `null` if the DNA is
 * below SHARE_MIN_CHOICES — we refuse to generate low-signal share
 * links at the source, not just hide the button.
 */
export function buildDNAShareUrl(
  baseUrl: string,
  dna: ChoiceDNA,
  extras: DNAShareExtras = {},
): string | null {
  if (dna.totalChoices < SHARE_MIN_CHOICES) return null;

  const params = new URLSearchParams({
    type: safeText(dna.fullTitle, "Choice DNA"),
    archetype: safeText(dna.archetype, ""),
    tag: dna.topTag ?? "",
    choices: String(clampNumber(dna.totalChoices, 0, 999)),
  });
  if (extras.topCategory) params.set("cat", safeText(extras.topCategory, ""));
  if (extras.topAxisLabel) params.set("axis", safeText(extras.topAxisLabel, ""));

  return `${baseUrl.replace(/\/$/, "")}/dna/share?${params.toString()}`;
}

export function parseDNAShareParams(input: URLSearchParams | Record<string, string | string[] | undefined>) {
  const read = (key: string) => {
    if (input instanceof URLSearchParams) return input.get(key) ?? "";
    const value = input[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };

  const type = safeText(decodeURIComponent(read("type")), "Choice DNA");
  const archetype = safeText(decodeURIComponent(read("archetype")), type);
  const tag = read("tag") || null;
  const choices = clampNumber(Number(read("choices")) || 0, 0, 999);
  const topCategoryRaw = read("cat");
  const topAxisRaw = read("axis");
  const topCategory = topCategoryRaw ? safeText(decodeURIComponent(topCategoryRaw), "") || null : null;
  const topAxisLabel = topAxisRaw ? safeText(decodeURIComponent(topAxisRaw), "") || null : null;
  const locked = choices < SHARE_MIN_CHOICES;

  const ogParams = new URLSearchParams({
    type,
    choices: String(choices),
  });
  if (topCategory) ogParams.set("cat", topCategory);
  if (topAxisLabel) ogParams.set("axis", topAxisLabel);

  return {
    type,
    archetype,
    tag,
    choices,
    topCategory,
    topAxisLabel,
    locked,
    ogImageUrl: `${SITE.url}/api/og/dna?${ogParams.toString()}`,
  };
}
