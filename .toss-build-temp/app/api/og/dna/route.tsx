import { ImageResponse } from "next/og";
import { parseDNAShareParams } from "@/lib/share";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const share = parseDNAShareParams(searchParams);

  // Locked / low-signal → generic invite card, never expose partial DNA.
  if (share.locked) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%", height: "100%", display: "flex",
            flexDirection: "column", justifyContent: "center", alignItems: "center",
            padding: "48px 52px",
            background: "#0a0b10",
            color: "#f1f5f9",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.3em", color: "rgba(165,243,252,0.7)" }}>
            ROUND
          </div>
          <div style={{
            display: "flex", fontSize: 68, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.04em", marginTop: 20, textAlign: "center",
          }}>
            내 선택 패턴으로 만드는
          </div>
          <div style={{
            display: "flex", fontSize: 68, fontWeight: 900, lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}>
            Choice DNA
          </div>
          <div style={{
            display: "flex", fontSize: 22, color: "rgba(255,255,255,0.5)",
            marginTop: 32,
          }}>
            고르고, 결과 보고, 남의 이유 읽기
          </div>
        </div>
      ),
      { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=600" } },
    );
  }

  const narrativeLine =
    share.topCategory && share.topAxisLabel
      ? `${share.topCategory} 질문에서 ${share.topAxisLabel} 성향이 더 자주 보였어요`
      : share.topAxisLabel
        ? `${share.topAxisLabel} 성향이 더 자주 보였어요`
        : share.topCategory
          ? `${share.topCategory} 질문에 가장 많이 반응했어요`
          : "내 선택 패턴으로 만든 DNA";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          padding: "52px 56px",
          background: "#0a0b10",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단: 브랜드 + 수집 정보 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.32em", color: "rgba(165,243,252,0.75)" }}>
              ROUND
            </div>
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.22em", color: "rgba(255,255,255,0.35)" }}>
              CHOICE DNA
            </div>
          </div>
          <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.12)", marginTop: 14 }} />
        </div>

        {/* 중앙: 태그 + archetype + 서사 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1, justifyContent: "center" }}>
          {share.tag && (
            <div style={{ display: "flex", fontSize: 24, color: "rgba(34,211,238,0.8)" }}>
              #{share.tag}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 72, fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.045em" }}>
            {share.archetype}
          </div>
          <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.08)", marginTop: 4 }} />
          <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
            {share.choices}개의 선택으로 쌓인 패턴
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            {narrativeLine}
          </div>
        </div>

        {/* 하단: 초대 CTA + 브랜드 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.4)" }}>
            나랑 비슷한 타입일까?
          </div>
          <div style={{
            display: "flex", borderRadius: "999px", background: "#f8fafc",
            padding: "12px 22px", color: "#020617", fontSize: 18, fontWeight: 800,
          }}>
            Round
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=600" } },
  );
}
