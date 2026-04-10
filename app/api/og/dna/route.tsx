import { ImageResponse } from "next/og";
import { parseDNAShareParams } from "@/lib/share";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const share = parseDNAShareParams(searchParams);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          padding: "48px 52px",
          background: "#0a0b10",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        {/* 상단: 영수증 헤더 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: "0.35em", color: "rgba(165,243,252,0.7)" }}>
              ROUND
            </div>
            <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.25em", color: "rgba(255,255,255,0.35)" }}>
              LIFESTYLE RECEIPT
            </div>
          </div>
          <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.12)", marginTop: 12 }} />
        </div>

        {/* 중앙: DNA 정보 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
          {share.tag && (
            <div style={{ display: "flex", fontSize: 22, color: "rgba(34,211,238,0.8)" }}>
              #{share.tag}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 64, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em" }}>
            {share.archetype}
          </div>
          <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.08)", marginTop: 8 }} />

          {/* 항목 rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: 4 }}>
            {[
              ["TYPE", share.type],
              ["CHOICES", `${share.choices}회`],
              ...(share.tag ? [["TOP TAG", `#${share.tag}`]] : []),
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", fontSize: 16, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
                  {label}
                </div>
                <div style={{ display: "flex", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", height: 1, background: "rgba(255,255,255,0.08)", marginTop: 8 }} />

          <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.5 }}>
            나의 선택 패턴으로 만들어진 DNA 영수증
          </div>
        </div>

        {/* 하단: 브랜드 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 14, color: "rgba(255,255,255,0.25)" }}>
            round-app-one.vercel.app
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
