import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";

export const metadata: Metadata = {
  title: `마케팅 정보 수신 동의 — ${SITE.name}`,
  description: `${SITE.name} 서비스의 마케팅 정보 수신 동의 안내입니다.`,
};

export default function MarketingConsentPage() {
  return (
    <main className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 pb-safe-bottom text-white/90">
        <Link href="/about" className="mb-8 text-sm text-white/40 hover:text-white/60">
          ← Round 소개
        </Link>

        <h1 className="mb-2 text-2xl font-black tracking-tight">마케팅 정보 수신 동의</h1>
        <p className="mb-8 text-xs text-white/35">최종 수정일: 2026년 4월 8일</p>

        <div className="flex flex-col gap-8 text-sm leading-7 text-white/60">
          <Section title="1. 수신 항목">
            <p>
              {SITE.name}는 아래와 같은 서비스 관련 안내를 이메일로 발송할 수 있습니다.
            </p>
            <Ul>
              <li>서비스 업데이트 및 신규 기능 오픈 시 알림</li>
              <li>이벤트, 프로모션, 혜택 정보 안내</li>
              <li>서비스 이용을 돕는 추천 및 안내 정보</li>
            </Ul>
          </Section>

          <Section title="2. 수신 채널">
            <p>마케팅 정보는 이메일을 통해 발송됩니다.</p>
          </Section>

          <Section title="3. 동의 여부 및 철회">
            <p>
              본 동의는 선택 사항이며, 동의하지 않아도 {SITE.name} 서비스를 이용할 수 있습니다.
            </p>
            <p className="mt-3">
              동의 후에도 언제든지 이메일 수신 거부 또는 아래 문의처를 통해 철회를 요청할 수 있습니다.
            </p>
          </Section>

          <Section title="4. 문의">
            <p>마케팅 정보 수신 동의 관련 문의:</p>
            <div className="mt-1">
              <EmailContact />
            </div>
          </Section>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
          <div className="flex justify-center gap-6">
            <Link href="/about" className="hover:text-white/60">
              소개
            </Link>
            <Link href="/terms" className="hover:text-white/60">
              이용약관
            </Link>
            <Link href="/privacy" className="hover:text-white/60">
              개인정보처리방침
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-white/80">{title}</h2>
      {children}
    </section>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="ml-4 list-disc space-y-1">{children}</ul>;
}
