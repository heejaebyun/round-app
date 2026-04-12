import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { parseDNAShareParams, SHARE_MIN_CHOICES } from "@/lib/share";
import { buildLocalizedPath } from "@/lib/localeRouting";
import { resolveServerLocale } from "@/lib/serverLocale";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const share = parseDNAShareParams(await searchParams);

  // Locked / low-signal share → show a generic invite card, not the
  // user's half-baked DNA.
  if (share.locked) {
    return {
      title: "Round — 내 선택 패턴을 DNA로",
      description: "고르고, 결과 보고, 남의 이유 읽기",
      openGraph: {
        title: "Round",
        description: "내 선택 패턴으로 만드는 Choice DNA",
        type: "website",
        url: `${SITE.url}/dna/share`,
      },
      twitter: { card: "summary_large_image", title: "Round" },
    };
  }

  const title = `${share.archetype} — Round`;
  const description = `${share.choices}개의 선택으로 쌓인 패턴`;

  return {
    title,
    description,
    openGraph: {
      title, description, type: "website",
      url: `${SITE.url}/dna/share`,
      images: [{ url: share.ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [share.ogImageUrl] },
  };
}

export default async function DNASharePage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const share = parseDNAShareParams(resolvedSearchParams);
  const { locale } = await resolveServerLocale(resolvedSearchParams);
  const homeHref = buildLocalizedPath("/", locale);

  // ── Locked: too few choices to trust the shared card ──────────
  if (share.locked) {
    return (
      <main className="round-canvas round-shell items-center justify-center px-5 py-10">
        <div className="round-panel-strong w-full max-w-sm rounded-3xl px-6 py-8 text-center">
          <p className="round-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/55">
            Choice DNA
          </p>
          <h1 className="mt-3 text-[22px] font-black leading-tight tracking-[-0.03em] text-white">
            아직 DNA가 쌓이지 않았어요
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {SHARE_MIN_CHOICES}개 이상의 선택이 쌓이면
            <br />
            내 패턴이 만들어져요.
          </p>
          <Link
            href={homeHref}
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-white py-3.5 text-sm font-bold text-slate-900"
          >
            내 DNA 만들러 가기
          </Link>
        </div>
      </main>
    );
  }

  // ── Unlocked: real narrative share card ────────────────────────
  const hasNarrative = !!(share.topCategory || share.topAxisLabel);

  return (
    <main className="round-canvas round-shell items-center justify-center px-5 py-10">
      <div className="round-panel-strong w-full max-w-sm rounded-[28px] px-6 py-7 text-center">
        <p className="round-mono text-[10px] uppercase tracking-[0.32em] text-cyan-200/55">
          Choice DNA
        </p>
        {share.tag && (
          <p className="mt-3 text-xs font-semibold text-cyan-300/80">#{share.tag}</p>
        )}
        <h1 className="mt-2 text-[24px] font-black leading-tight tracking-[-0.035em] text-white">
          {share.archetype}
        </h1>

        <p className="mt-4 text-[13px] leading-relaxed text-white/60">
          {share.choices}개의 선택으로 쌓인 패턴
        </p>

        {hasNarrative && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
            {share.topCategory && share.topAxisLabel
              ? `${share.topCategory} 질문에서 ${share.topAxisLabel} 성향이 더 자주 보였어요`
              : share.topAxisLabel
                ? `${share.topAxisLabel} 성향이 더 자주 보였어요`
                : `${share.topCategory} 질문에 가장 많이 반응했어요`}
          </p>
        )}

        <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-[13px] font-semibold leading-relaxed text-cyan-100/80">
          나랑 비슷한 타입일까?
        </div>

        <Link
          href={homeHref}
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white py-3.5 text-sm font-bold text-slate-900 active:scale-[0.985]"
        >
          나도 내 DNA 만들기
        </Link>
      </div>
    </main>
  );
}
