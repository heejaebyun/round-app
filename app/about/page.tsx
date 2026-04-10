import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "매일 사람들의 선택과 이유가 갈리는 곳.",
};

export default function AboutPage() {
  return (
    <main className="no-scrollbar h-full overflow-y-auto">
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 text-white/90 pb-safe-bottom">
      {/* Hero */}
      <header className="mb-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-cyan-400 font-mono text-xl font-black text-cyan-400">
          R
        </div>
        <h1 className="text-3xl font-black tracking-tight">{SITE.name}</h1>
        <p className="mt-2 text-base text-white/55">{SITE.tagline}</p>
      </header>

      {/* 소개 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-white/80">Round는</h2>
        <p className="text-sm leading-7 text-white/60">
          매일 사람들의 선택과 이유가 갈리는 질문을 빠르게 보고, 바로
          고르고, 결과와 이유까지 이어서 읽는 서비스입니다. Round는 질문을
          발명하는 곳보다 현실에서 이미 갈리고 있는 긴장을 포착해 구조화하는
          쪽에 더 가깝습니다.
        </p>
        <p className="mt-3 text-sm leading-7 text-white/60">
          토스 계정으로 간편하게 연결하면 선택 기록과 닉네임을 이어서 사용할 수 있습니다.
        </p>
      </section>

      {/* 핵심 경험 */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold text-white/80">이렇게 써요</h2>
        <ol className="flex flex-col gap-3 text-sm text-white/60">
          {[
            ["1", "질문 카드를 봅니다"],
            ["2", "A 또는 B를 고릅니다"],
            ["3", "즉시 결과 %를 확인합니다"],
            ["4", "다른 사람들의 이유를 읽습니다"],
            ["5", "쓰레드로 들어가 다른 의견을 더 읽습니다"],
            ["6", "선택 기록이 쌓여 프로필과 DNA가 선명해집니다"],
          ].map(([n, text]) => (
            <li key={n} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 font-mono text-xs font-bold text-cyan-300">
                {n}
              </span>
              <span className="leading-6">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 문의 */}
      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-white/80">문의</h2>
        <p className="text-sm text-white/60">
          서비스 관련 문의는 아래 이메일로 보내주세요.
        </p>
        <div className="mt-2">
          <EmailContact />
        </div>
      </section>

      {/* Footer links */}
      <footer className="mt-auto border-t border-white/10 pt-6 text-center text-xs text-white/35">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-white/60">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:text-white/60">
            이용약관
          </Link>
          <Link href="/marketing-consent" className="hover:text-white/60">
            마케팅 정보 수신 동의
          </Link>
        </div>
        <p className="mt-4">© 2026 {SITE.name}. All rights reserved.</p>
      </footer>
    </div>
    </main>
  );
}
