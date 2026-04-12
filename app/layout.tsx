import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Round",
  description: "고르고, 결과 보고, 남의 이유 읽기",
  metadataBase: new URL(SITE.url),
  manifest: "/manifest.json",
  openGraph: {
    title: "Round",
    description: "고르고, 결과 보고, 남의 이유 읽기",
    url: SITE.url,
    siteName: "Round",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Round",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Round",
    description: "고르고, 결과 보고, 남의 이유 읽기",
    images: ["/opengraph-image"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Round",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08080d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full bg-[#050608]">{children}</body>
    </html>
  );
}
