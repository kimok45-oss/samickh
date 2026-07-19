import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { getLang } from "@/lib/lang";
import { rootMetadata } from "@/lib/seo/metadata";
import PageViewTracker from "@/components/PageViewTracker";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = rootMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang} className={plexMono.variable}>
      <head>
        {/* Pretendard 동적 서브셋(공식) — 페이지에 실제 쓰인 유니코드 구간만 다운로드(풀 2MB 대체) */}
        <link rel="stylesheet" href="/fonts/pretendardvariable-dynamic-subset.css" />
      </head>
      <body className="min-h-dvh bg-bg text-ink antialiased">
        {children}
        <PageViewTracker />
      </body>
    </html>
  );
}
