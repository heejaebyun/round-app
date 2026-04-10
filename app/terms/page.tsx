import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";

export const metadata: Metadata = {
  title: `이용약관 — ${SITE.name}`,
  description: `${SITE.name} 서비스 이용에 관한 약관입니다.`,
};

export default function TermsPage() {
  return (
    <main className="no-scrollbar h-full overflow-y-auto">
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 text-white/90 pb-safe-bottom">
      <Link href="/about" className="mb-8 text-sm text-white/40 hover:text-white/60">
        ← Round 소개
      </Link>

      <h1 className="mb-2 text-2xl font-black tracking-tight">서비스 이용약관</h1>
      <p className="mb-8 text-xs text-white/35">최종 수정일: 2026년 4월 8일</p>

      <div className="flex flex-col gap-8 text-sm leading-7 text-white/60">
        <Section title="1. 서비스 목적">
          <p>
            {SITE.name}는 A/B 선택 기반의 소셜 경험 서비스입니다.
            사용자는 질문에 답하고, 결과를 확인하며,
            선택 패턴을 통해 자신의 성향(Choice DNA)을 발견할 수 있습니다.
          </p>
        </Section>

        <Section title="2. 이용자의 책임">
          <p>이용자는 서비스를 이용할 때 다음을 준수해야 합니다.</p>
          <Ul>
            <li>타인의 권리를 침해하지 않을 것</li>
            <li>허위 정보를 입력하지 않을 것</li>
            <li>서비스 운영을 방해하지 않을 것</li>
          </Ul>
        </Section>

        <Section title="3. 금지 행위">
          <p>다음 행위는 금지되며, 위반 시 이용이 제한될 수 있습니다.</p>
          <Ul>
            <li>서비스 악용 (비정상적 반복 투표, 자동화 도구 사용 등)</li>
            <li>타인의 기기 정보 도용</li>
            <li>욕설, 혐오 표현 등 부적절한 내용 작성</li>
            <li>서비스 인프라에 대한 의도적 공격</li>
          </Ul>
        </Section>

        <Section title="4. 계정 연동">
          <p>
            {SITE.name}는 토스 로그인 기능을 통해 이용자 계정을 연동할 수 있습니다.
            연동 시 이름, 이메일 등 토스 회원 정보가 수집되며, 동일한 사용자를 식별하고 재방문 시 이용 기록을 이어서 제공하기 위한 목적으로 사용됩니다.
          </p>
        </Section>

        <Section title="5. 이용자 생성 콘텐츠">
          <p>
            이용자가 작성한 이유, 답글 등 텍스트 콘텐츠에 대한 권리와 책임은 작성한 이용자에게 있습니다.
            다만 서비스 운영, 표시, 집계, 품질 관리 목적 범위 안에서 {SITE.name}가 이를 저장, 노출, 편집 없이 재배치할 수 있습니다.
          </p>
          <p className="mt-3">
            타인의 권리를 침해하거나 운영 정책에 위반되는 콘텐츠는 사전 통지 없이 삭제되거나 이용이 제한될 수 있습니다.
          </p>
          <p className="mt-3">
            이용자가 설정한 닉네임은 다른 이용자에게 노출될 수 있으며, 부적절하거나 혼동을 일으키는 닉네임은 서비스 운영 정책에 따라 제한 또는 변경 요청될 수 있습니다.
          </p>
        </Section>

        <Section title="6. 서비스 변경 및 중단">
          <p>
            {SITE.name}는 서비스 내용을 변경하거나 일시적으로 중단할 수 있습니다.
            중요한 변경이 있을 경우 서비스 내 공지를 통해 안내합니다.
          </p>
        </Section>

        <Section title="7. 콘텐츠 면책">
          <p>
            서비스 내에서 제공되는 선택 결과, Choice DNA, 다른 사용자의 이유 등은
            참고용 경험 요소이며, 전문적인 판단이나 조언을 대체하지 않습니다.{" "}
            {SITE.name}는 이러한 콘텐츠의 정확성이나 완전성을 보증하지 않습니다.
          </p>
        </Section>

        <Section title="8. 문의">
          <p>약관 관련 문의:</p>
          <div className="mt-1"><EmailContact /></div>
        </Section>

        <Section title="9. 약관 변경">
          <p>
            본 약관은 서비스 운영 상황에 따라 변경될 수 있으며,
            변경 시 서비스 내 공지를 통해 안내합니다.
          </p>
        </Section>
      </div>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
        <div className="flex justify-center gap-6">
          <Link href="/about" className="hover:text-white/60">소개</Link>
          <Link href="/privacy" className="hover:text-white/60">개인정보처리방침</Link>
          <Link href="/marketing-consent" className="hover:text-white/60">마케팅 정보 수신 동의</Link>
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
