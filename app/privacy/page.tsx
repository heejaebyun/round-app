import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";

export const metadata: Metadata = {
  title: `개인정보처리방침 — ${SITE.name}`,
  description: `${SITE.name} 서비스의 개인정보 수집 및 이용에 관한 안내입니다.`,
};

export default function PrivacyPage() {
  return (
    <main className="no-scrollbar h-full overflow-y-auto">
    <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 text-white/90 pb-safe-bottom">
      <Link href="/about" className="mb-8 text-sm text-white/40 hover:text-white/60">
        ← Round 소개
      </Link>

      <h1 className="mb-2 text-2xl font-black tracking-tight">개인정보처리방침</h1>
      <p className="mb-8 text-xs text-white/35">최종 수정일: 2026년 4월 8일</p>

      <div className="flex flex-col gap-8 text-sm leading-7 text-white/60">
        <Section title="1. 수집하는 정보">
          <p>{SITE.name}는 서비스 제공을 위해 다음 정보를 수집합니다.</p>
          <Ul>
            <li>기기 식별자 (device_id) — 비로그인 상태에서 사용자를 구분하기 위한 임의 UUID</li>
            <li>토스 로그인 식별 정보 (userKey, 이름, 이메일, 동의 scope, 약관 동의 정보) — 토스 회원 연동 시</li>
            <li>닉네임 — 서비스 내 공개 표시 이름으로 이용자가 직접 설정한 정보</li>
            <li>선택 정보 — 사용자가 질문에서 고른 A/B 선택</li>
            <li>이유 작성 내용 — 사용자가 자발적으로 입력한 한 줄 이유</li>
            <li>답글 작성 내용 — 다른 이용자의 이유에 대해 남긴 짧은 반응 및 댓글</li>
            <li>이벤트 로그 — 서비스 이용 과정에서 발생하는 행동 기록 (카드 조회, 선택, 결과 확인 등)</li>
          </Ul>
        </Section>

        <Section title="2. 수집 목적">
          <Ul>
            <li>A/B 선택 결과 집계 및 퍼센트 표시</li>
            <li>Choice DNA (성향 분석) 계산</li>
            <li>다른 사용자에게 이유 공유</li>
            <li>닉네임 및 답글을 포함한 커뮤니티 상호작용 제공</li>
            <li>토스 로그인 기반 사용자 식별(이름, 이메일), 닉네임 설정 및 재방문 연결</li>
            <li>서비스 개선 및 운영 분석</li>
          </Ul>
        </Section>

        <Section title="3. 보관 및 처리">
          <p>
            수집된 정보는 외부 클라우드 인프라(Supabase 등)에 저장되며,
            서비스 운영 목적으로만 사용합니다.
            회원 식별 정보(토스 로그인 정보, 이메일, 닉네임)는 회원 연동이 유지되는 동안 보관하며,
            선택 정보, 이유, 답글, 이벤트 로그는 서비스 운영 및 분석 목적 범위 안에서 보관합니다.
            서비스 종료 또는 보관 목적 달성 시 관련 정보는 지체 없이 파기합니다.
          </p>
        </Section>

        <Section title="4. 제3자 제공">
          <p>
            현재 수집된 정보를 외부 제3자에게 제공하지 않습니다.
            향후 변경이 필요한 경우 사전 고지합니다.
          </p>
        </Section>

        <Section title="5. 이용자 권리">
          <p>
            이용자는 언제든지 수집된 정보의 열람, 삭제를 요청할 수 있습니다.
            아래 이메일로 문의해주세요.
          </p>
          <p className="mt-3">
            토스 로그인 연동을 해제하면 회원 식별 정보는 삭제되며, 기존 선택, 이유, 답글은 익명 상태로 전환될 수 있습니다.
          </p>
        </Section>

        <Section title="6. 문의">
          <p>개인정보 관련 문의:</p>
          <div className="mt-1"><EmailContact /></div>
        </Section>

        <Section title="7. 변경 사항">
          <p>
            본 방침은 서비스 변경에 따라 수정될 수 있으며,
            변경 시 서비스 내 공지를 통해 안내합니다.
          </p>
        </Section>
      </div>

      <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
        <div className="flex justify-center gap-6">
          <Link href="/about" className="hover:text-white/60">소개</Link>
          <Link href="/terms" className="hover:text-white/60">이용약관</Link>
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
