import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import EmailContact from "@/components/EmailContact";
import { resolveServerLocale } from "@/lib/serverLocale";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { isEn } = await resolveServerLocale(await searchParams);
  return {
    title: isEn ? `Terms of Service — ${SITE.name}` : `이용약관 — ${SITE.name}`,
    description: isEn
      ? `Terms governing the use of ${SITE.name}.`
      : `${SITE.name} 서비스 이용에 관한 약관입니다.`,
  };
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

export default async function TermsPage({ searchParams }: PageProps) {
  const { locale, isEn } = await resolveServerLocale(await searchParams);

  return (
    <main className="no-scrollbar h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-lg flex-col px-6 py-12 text-white/90 pb-safe-bottom">
        <Link href={`/about${isEn ? "?locale=" + locale : ""}`} className="mb-8 text-sm text-white/40 hover:text-white/60">
          {isEn ? "← About Round" : "← Round 소개"}
        </Link>

        <h1 className="mb-2 text-2xl font-black tracking-tight">
          {isEn ? "Terms of Service" : "서비스 이용약관"}
        </h1>
        <p className="mb-8 text-xs text-white/35">
          {isEn ? "Last updated: April 8, 2026" : "최종 수정일: 2026년 4월 8일"}
        </p>

        <div className="flex flex-col gap-8 text-sm leading-7 text-white/60">
          <Section title={isEn ? "1. Purpose" : "1. 서비스 목적"}>
            <p>
              {isEn
                ? `${SITE.name} is a social polling service built around A/B choices. Users answer questions, see results, and discover their personality patterns (Choice DNA) through their picks.`
                : `${SITE.name}는 A/B 선택 기반의 소셜 경험 서비스입니다. 사용자는 질문에 답하고, 결과를 확인하며, 선택 패턴을 통해 자신의 성향(Choice DNA)을 발견할 수 있습니다.`}
            </p>
          </Section>

          <Section title={isEn ? "2. User Responsibilities" : "2. 이용자의 책임"}>
            <p>{isEn ? "Users must:" : "이용자는 서비스를 이용할 때 다음을 준수해야 합니다."}</p>
            <Ul>
              <li>{isEn ? "Not infringe on the rights of others" : "타인의 권리를 침해하지 않을 것"}</li>
              <li>{isEn ? "Not provide false information" : "허위 정보를 입력하지 않을 것"}</li>
              <li>{isEn ? "Not interfere with service operations" : "서비스 운영을 방해하지 않을 것"}</li>
            </Ul>
          </Section>

          <Section title={isEn ? "3. Prohibited Actions" : "3. 금지 행위"}>
            <p>{isEn ? "The following actions are prohibited and may result in restricted access:" : "다음 행위는 금지되며, 위반 시 이용이 제한될 수 있습니다."}</p>
            <Ul>
              <li>{isEn ? "Service abuse (automated voting, bots, etc.)" : "서비스 악용 (비정상적 반복 투표, 자동화 도구 사용 등)"}</li>
              <li>{isEn ? "Impersonation or device spoofing" : "타인의 기기 정보 도용"}</li>
              <li>{isEn ? "Hate speech, harassment, or inappropriate content" : "욕설, 혐오 표현 등 부적절한 내용 작성"}</li>
              <li>{isEn ? "Intentional attacks on service infrastructure" : "서비스 인프라에 대한 의도적 공격"}</li>
            </Ul>
          </Section>

          <Section title={isEn ? "4. User-Generated Content" : "5. 이용자 생성 콘텐츠"}>
            <p>
              {isEn
                ? `Users own their written content (reasons, replies). ${SITE.name} may store, display, and rearrange this content for service operations without editing it. Content that violates policies may be removed without notice.`
                : `이용자가 작성한 이유, 답글 등 텍스트 콘텐츠에 대한 권리와 책임은 작성한 이용자에게 있습니다. 다만 서비스 운영, 표시, 집계, 품질 관리 목적 범위 안에서 ${SITE.name}가 이를 저장, 노출, 편집 없이 재배치할 수 있습니다. 타인의 권리를 침해하거나 운영 정책에 위반되는 콘텐츠는 사전 통지 없이 삭제되거나 이용이 제한될 수 있습니다.`}
            </p>
          </Section>

          <Section title={isEn ? "5. Service Changes" : "6. 서비스 변경 및 중단"}>
            <p>
              {isEn
                ? `${SITE.name} may modify or temporarily suspend the service. Significant changes will be communicated through in-app notices.`
                : `${SITE.name}는 서비스 내용을 변경하거나 일시적으로 중단할 수 있습니다. 중요한 변경이 있을 경우 서비스 내 공지를 통해 안내합니다.`}
            </p>
          </Section>

          <Section title={isEn ? "6. Disclaimer" : "7. 콘텐츠 면책"}>
            <p>
              {isEn
                ? `Poll results, Choice DNA, and user reasons are for entertainment only and do not constitute professional advice. ${SITE.name} does not guarantee their accuracy.`
                : `서비스 내에서 제공되는 선택 결과, Choice DNA, 다른 사용자의 이유 등은 참고용 경험 요소이며, 전문적인 판단이나 조언을 대체하지 않습니다. ${SITE.name}는 이러한 콘텐츠의 정확성이나 완전성을 보증하지 않습니다.`}
            </p>
          </Section>

          <Section title={isEn ? "7. Contact" : "8. 문의"}>
            <p>{isEn ? "Questions about these terms:" : "약관 관련 문의:"}</p>
            <div className="mt-1"><EmailContact /></div>
          </Section>

          <Section title={isEn ? "8. Changes to Terms" : "9. 약관 변경"}>
            <p>
              {isEn
                ? "These terms may be updated. Changes will be announced through in-app notices."
                : "본 약관은 서비스 운영 상황에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다."}
            </p>
          </Section>
        </div>

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/35">
          <div className="flex justify-center gap-6">
            <Link href={`/about${isEn ? "?locale=" + locale : ""}`} className="hover:text-white/60">{isEn ? "About" : "소개"}</Link>
            <Link href={`/privacy${isEn ? "?locale=" + locale : ""}`} className="hover:text-white/60">{isEn ? "Privacy" : "개인정보처리방침"}</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
