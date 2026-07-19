// 전역 404 — 브랜드(머신 다크·형번 문법)·ko/en. slug 미존재 notFound()가 여기로 온다.
import Link from "next/link";
import { getLang } from "@/lib/lang";

export default async function NotFound() {
  const lang = await getLang();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center text-ink">
      <p className="font-mono text-[11.5px] font-bold uppercase tracking-[0.24em] text-ink-faint">
        SAMICK H&P
      </p>
      <h1 className="mt-4 font-mono text-[clamp(3.5rem,10vw,6rem)] font-bold leading-none tracking-tight">
        404
      </h1>
      <p className="mt-4 text-[15px] font-semibold text-ink-dim">
        {lang === "ko" ? "요청하신 페이지를 찾을 수 없습니다." : "The page you requested could not be found."}
      </p>
      <p className="mt-1.5 text-[13px] text-ink-faint">
        {lang === "ko"
          ? "주소가 변경되었거나 삭제된 페이지일 수 있습니다."
          : "The address may have been changed or removed."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center bg-red px-6 py-3 font-mono text-[13px] font-bold text-white transition-opacity hover:opacity-90"
        >
          {lang === "ko" ? "홈으로" : "Go Home"}
        </Link>
        <Link
          href="/sitemap-page"
          className="inline-flex items-center border border-line px-6 py-3 font-mono text-[13px] font-bold text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
        >
          {lang === "ko" ? "사이트맵" : "Sitemap"}
        </Link>
      </div>
    </main>
  );
}
