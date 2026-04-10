import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Round — 골라봐";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "radial-gradient(circle at top, rgba(34,211,238,0.22), transparent 30%), radial-gradient(circle at 80% 20%, rgba(129,140,248,0.22), transparent 28%), linear-gradient(180deg, #090b10 0%, #05060a 100%)",
          color: "#f8fafc",
          padding: "56px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "760px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: "rgba(165,243,252,0.84)",
            }}
          >
            Choice DNA
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            Round
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.45,
              color: "rgba(241,245,249,0.82)",
            }}
          >
            {SITE.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            {[
              "질문 카드",
              "즉시 결과",
              "다른 사람 이유",
              "DNA 프로필",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 22,
                  color: "rgba(248,250,252,0.78)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            round-app-one.vercel.app
          </div>
        </div>
      </div>
    ),
    size,
  );
}
