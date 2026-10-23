"use client";

// 페이지 끝 문의 꼬리 — 서브 페이지를 다 읽은 방문자가 메뉴로 돌아가지 않고 바로 견적·문의로 가는 길.
// 2026-10-22 오너 '나머지 다 진행'(5-1-1 ③ 페이지 끝 문의 꼬리 · ④ 문의 폼 제품 이름 미리 채우기).
//  · 생김새는 홈 «견적·문의» 상자 말투 그대로(괘선 + 레드 CTA 1개 + 테두리 버튼) — 새 장식 없음.
//  · 홈(이미 견적·문의로 끝남)·견적요청·온라인문의 페이지(폼이 곧 끝)에는 붙이지 않는다.
//  · 사업분야 계열 상세(/business/<slug>)에서는 견적요청 링크에 ?series=<slug> 를 붙여, 견적 폼 '내용'에
//    그 계열 이름·형번이 미리 들어간다(이름은 서버가 DB 에서 다시 찾는다 — 주소창 값을 그대로 쓰지 않음).
//  · 전화는 공용 telHref(대표 번호만 — "053-591-9931~2" → tel:0535919931).
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/lang";
import { telHref } from "@/lib/tel";

const T = {
  ko: { head: "견적·문의", tel: "전화", desc: "형번·사양·수량을 적어 보내는 견적요청 — 도면(PDF·DWG·DWF) 첨부 가능.", quote: "견적요청", inquiry: "온라인문의" },
  en: { head: "Quote & Inquiry", tel: "Tel", desc: "Quote requests by model code, specification and quantity — drawings (PDF, DWG, DWF) can be attached.", quote: "Request a Quote", inquiry: "Inquiry" },
};

const HIDE = ["/support/quote", "/support/inquiry"];

export default function ContactTail({ lang, tel }: { lang: Lang; tel: string }) {
  const pathname = usePathname() ?? "";
  if (pathname === "/" || HIDE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const t = T[lang];
  const m = /^\/business\/([a-z0-9-]{1,60})$/.exec(pathname);
  const quoteHref = m ? `/support/quote?series=${m[1]}` : "/support/quote";
  const href = telHref(tel);

  return (
    <section aria-label={t.head} className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-10 gap-y-5 px-5 py-9 md:px-8">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-ink">{t.head}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-dim">
            {t.desc}
            {href && (
              <>
                {" "}
                <span className="whitespace-nowrap">
                  {t.tel}{" "}
                  <a href={href} className="tnum font-semibold text-ink underline-offset-4 hover:underline">
                    {tel}
                  </a>
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={quoteHref}
            className="inline-flex h-10 items-center bg-red px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-red-live"
          >
            {t.quote}
          </Link>
          <Link
            href="/support/inquiry"
            className="inline-flex h-10 items-center border border-line px-5 text-[13.5px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
          >
            {t.inquiry}
          </Link>
        </div>
      </div>
    </section>
  );
}
