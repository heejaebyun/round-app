import { SITE } from "@/lib/site";
import type { ChoiceDNA } from "@/lib/types";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function safeText(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 32) : fallback;
}

export function buildDNAShareUrl(baseUrl: string, dna: ChoiceDNA) {
  const params = new URLSearchParams({
    type: safeText(dna.fullTitle, "Choice DNA"),
    archetype: safeText(dna.archetype, ""),
    tag: dna.topTag ?? "",
    choices: String(clampNumber(dna.totalChoices, 0, 999)),
  });

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

  return {
    type,
    archetype,
    tag,
    choices,
    ogImageUrl: `${SITE.url}/api/og/dna?type=${encodeURIComponent(type)}&choices=${choices}`,
  };
}
