import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";
import { resolveServerLocale } from "@/lib/serverLocale";

export const metadata: Metadata = {
  title: `Privacy Policy — ${SITE.name}`,
  description: `How ${SITE.name} collects and uses your data.`,
};

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

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PrivacyPage({ searchParams }: Props) {
  const { locale, isEn } = await resolveServerLocale(await searchParams);

  return (
    <main className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 text-white/90 pb-safe-bottom">
        <Link href={`/about${isEn ? "?locale=" + locale : ""}`} className="mb-8 text-sm text-white/40 hover:text-white/60">
          {isEn ? "← About Round" : "← Round 소개"}
        </Link>

        <h1 className="mb-2 text-2xl font-black tracking-tight">
          {isEn ? "Privacy Policy" : "개인정보처리방침"}
        </h1>
        <p className="mb-8 text-xs text-white/35">
          {isEn ? "Last updated: April 8, 2026" : "최종 수정일: 2026년 4월 8일"}
        </p>

        <div className="flex flex-col gap-8 text-sm leading-7 text-white/60">
          <Section title={isEn ? "1. Information We Collect" : "1. 수집하는 정보"}>
            <p>{isEn ? `${SITE.name} collects the following to provide the service:` : `${SITE.name}는 서비스 제공을 위해 다음 정보를 수집합니다.`}</p>
            <Ul>
              <li>{isEn ? "Device ID — a random UUID to identify you without login" : "기기 식별자 (device_id) — 비로그인 상태에서 사용자를 구분하기 위한 임의 UUID"}</li>
              <li>{isEn ? "Toss login info (userKey, name, email) — when linked" : "토스 로그인 식별 정보 (userKey, 이름, 이메일) — 토스 회원 연동 시"}</li>
              <li>{isEn ? "Nickname — your chosen display name" : "닉네임 — 서비스 내 공개 표시 이름"}</li>
              <li>{isEn ? "Choices — your A/B picks" : "선택 정보 — A/B 선택"}</li>
              <li>{isEn ? "Reasons — your written explanations" : "이유 작성 내용"}</li>
              <li>{isEn ? "Replies — your responses to other reasons" : "답글 작성 내용"}</li>
              <li>{isEn ? "Event logs — usage activity (views, selections, etc.)" : "이벤트 로그 — 행동 기록 (카드 조회, 선택 등)"}</li>
            </Ul>
          </Section>

          <Section title={isEn ? "2. How We Use It" : "2. 수집 목적"}>
            <Ul>
              <li>{isEn ? "Show poll results and percentages" : "A/B 선택 결과 집계 및 퍼센트 표시"}</li>
              <li>{isEn ? "Calculate your Choice DNA" : "Choice DNA (성향 분석) 계산"}</li>
              <li>{isEn ? "Display reasons to other users" : "다른 사용자에게 이유 공유"}</li>
              <li>{isEn ? "Enable community interaction (nicknames, replies)" : "닉네임 및 답글을 포함한 커뮤니티 상호작용 제공"}</li>
              <li>{isEn ? "Identify returning users via Toss login" : "토스 로그인 기반 사용자 식별 및 재방문 연결"}</li>
              <li>{isEn ? "Improve the service" : "서비스 개선 및 운영 분석"}</li>
            </Ul>
          </Section>

          <Section title={isEn ? "3. Storage" : "3. 보관 및 처리"}>
            <p>
              {isEn
                ? `Data is stored on cloud infrastructure (Supabase). Account info is kept while linked; choices, reasons, and logs are retained for service operation. Everything is deleted when the service ends or the purpose is fulfilled.`
                : "수집된 정보는 외부 클라우드 인프라(Supabase 등)에 저장되며, 서비스 운영 목적으로만 사용합니다. 회원 식별 정보는 회원 연동이 유지되는 동안 보관하며, 서비스 종료 또는 보관 목적 달성 시 지체 없이 파기합니다."}
            </p>
          </Section>

          <Section title={isEn ? "4. Third-Party Sharing" : "4. 제3자 제공"}>
            <p>
              {isEn
                ? "We do not share your data with third parties. If this changes, we'll notify you in advance."
                : "현재 수집된 정보를 외부 제3자에게 제공하지 않습니다. 향후 변경이 필요한 경우 사전 고지합니다."}
            </p>
          </Section>

          <Section title={isEn ? "5. Your Rights" : "5. 이용자 권리"}>
            <p>
              {isEn
                ? "You can request to view or delete your data at any time via the email below. Unlinking Toss login removes account info; existing choices and reasons may be anonymized."
                : "이용자는 언제든지 수집된 정보의 열람, 삭제를 요청할 수 있습니다. 토스 로그인 연동을 해제하면 회원 식별 정보는 삭제되며, 기존 선택, 이유, 답글은 익명 상태로 전환될 수 있습니다."}
            </p>
          </Section>

          <Section title={isEn ? "6. Contact" : "6. 문의"}>
            <p>{isEn ? "Privacy-related questions:" : "개인정보 관련 문의:"}</p>
            <div className="mt-1"><EmailContact /></div>
          </Section>

          <Section title={isEn ? "7. Changes" : "7. 변경 사항"}>
            <p>
              {isEn
                ? "This policy may be updated. Changes will be announced through in-app notices."
                : "본 방침은 서비스 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다."}
            </p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
          <div className="flex justify-center gap-6">
            <Link href={`/about${isEn ? "?locale=" + locale : ""}`} className="hover:text-white/60">{isEn ? "About" : "소개"}</Link>
            <Link href={`/terms${isEn ? "?locale=" + locale : ""}`} className="hover:text-white/60">{isEn ? "Terms" : "이용약관"}</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
