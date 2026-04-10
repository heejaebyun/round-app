import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { parseDNAShareParams } from "@/lib/share";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const share = parseDNAShareParams(await searchParams);
  const title = `${share.type} — Round`;
  const description = `${share.choices}회 선택으로 만들어진 DNA`;

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
  const share = parseDNAShareParams(await searchParams);

  return (
    <main className="round-shell flex min-h-screen items-center justify-center px-5 py-10">
      <div className="round-panel-strong w-full max-w-sm rounded-3xl px-5 py-6 text-center">
        <p className="round-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/50">
          Choice DNA
        </p>
        {share.tag && (
          <p className="mt-2 text-xs font-semibold text-cyan-300/70">#{share.tag}</p>
        )}
        <h1 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          {share.archetype}
        </h1>
        <p className="mt-2 text-xs text-white/45">
          {share.choices}회 선택으로 만들어진 결과
        </p>

        <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3 text-[13px] leading-relaxed text-cyan-100/70">
          내 DNA는 뭘까?
        </div>

        <div className="mt-5 flex gap-2.5">
          <Link
            href="/"
            className="flex-1 rounded-2xl bg-white py-3 text-center text-sm font-bold text-slate-900"
          >
            시작하기
          </Link>
          <Link
            href="/dna"
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-center text-sm font-semibold text-white/70"
          >
            내 DNA 보기
          </Link>
        </div>
      </div>
    </main>
  );
}
