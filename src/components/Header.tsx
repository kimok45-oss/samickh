"use client";

// 공개면 헤더 — 3분할(로고 좌 · GNB 중앙 · 유틸 우) + 견적요청 CTA 상시 + LangToggle.
// GNB = 원본 IA 유지: 회사소개 / 사업분야 / 제품소개 / 고객지원 / 커뮤니티.
// 자유게시판·QNA·FAQ는 메뉴에 넣지 않는다(빈 게시판 — BUILD-CONTRACT).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/lang";
import { LangToggle } from "@/components/LangToggle";

type NavItem = { href: string; ko: string; en: string };
type NavGroup = { href: string; ko: string; en: string; children: NavItem[] };

const NAV: NavGroup[] = [
  {
    href: "/company/greeting",
    ko: "회사소개",
    en: "Company",
    children: [
      { href: "/company/greeting", ko: "인사말", en: "Greeting" },
      { href: "/company/history", ko: "회사연혁", en: "History" },
      { href: "/company/clients", ko: "주요거래업체", en: "Clients" },
      { href: "/company/organization", ko: "조직현황", en: "Organization" },
      { href: "/company/location", ko: "찾아오시는길", en: "Location" },
    ],
  },
  {
    href: "/business",
    ko: "사업분야",
    en: "Business",
    children: [
      { href: "/business", ko: "실린더 10계열", en: "10 Cylinder Series" },
    ],
  },
  {
    href: "/products",
    ko: "제품소개",
    en: "Products",
    children: [
      { href: "/products", ko: "제품소개", en: "Product Catalog" },
      { href: "/products/order-guide", ko: "실린더 주문방법", en: "How to Order" },
    ],
  },
  {
    href: "/support/resources",
    ko: "고객지원",
    en: "Support",
    children: [
      { href: "/support/resources", ko: "유공압자료", en: "Technical Data" },
      { href: "/support/cad", ko: "DWG/DWF DATA", en: "DWG/DWF Data" },
      { href: "/support/product-info", ko: "PRODUCT INFORMATION", en: "Product Information" },
      { href: "/support/inquiry", ko: "온라인문의", en: "Inquiry" },
      { href: "/support/quote", ko: "견적요청", en: "Request a Quote" },
    ],
  },
  {
    href: "/news/notice",
    ko: "커뮤니티",
    en: "Community",
    children: [
      { href: "/news/notice", ko: "공지사항", en: "Notice" },
      { href: "/news/industry", ko: "업계관련뉴스", en: "Industry News" },
    ],
  },
];

function topOf(pathname: string): string {
  // /company/* → 회사소개, /business* → 사업분야 ... (활성 GNB 판정)
  if (pathname.startsWith("/company")) return "/company/greeting";
  if (pathname.startsWith("/business")) return "/business";
  if (pathname.startsWith("/products")) return "/products";
  if (pathname.startsWith("/support")) return "/support/resources";
  if (pathname.startsWith("/news")) return "/news/notice";
  return "";
}

export default function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeTop = topOf(pathname);

  // 라우트가 바뀌면 모바일 드로어 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 드로어 열림 동안 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/92 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 md:px-8">
        {/* 좌: 로고(원본 CI 이미지 이식 — samickh.co.kr /images/common/logo.gif) */}
        <Link href="/" className="flex items-center" aria-label={lang === "ko" ? "삼익유공압주식회사 홈" : "SAMICK H&P home"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/orig/brand/logo.png"
            alt={lang === "ko" ? "삼익유공압주식회사 SAMICK H&P" : "SAMICK H&P"}
            width={243}
            height={67}
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        {/* 중앙: GNB (데스크톱) */}
        <nav aria-label={lang === "ko" ? "주요 메뉴" : "Main menu"} className="hidden justify-center lg:flex">
          <ul className="flex items-center">
            {NAV.map((g) => (
              <li key={g.href} className="group relative">
                <Link
                  href={g.href}
                  aria-current={activeTop === g.href ? "page" : undefined}
                  className={`relative block px-5 py-5 text-[14.5px] font-medium transition-colors ${
                    activeTop === g.href ? "text-ink" : "text-ink-dim hover:text-ink"
                  }`}
                >
                  {lang === "ko" ? g.ko : g.en}
                  {/* 활성 표시 — 하단 헤어라인(레드는 텍스트 금지 → 그래픽 라인으로만) */}
                  <span
                    aria-hidden
                    className={`absolute inset-x-5 bottom-0 h-px transition-opacity ${
                      activeTop === g.href ? "bg-red-live opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
                {/* 드롭다운 */}
                <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="min-w-[190px] border border-line bg-bg-panel py-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                    {g.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className={`block px-4 py-2 text-[13px] transition-colors ${
                            pathname === c.href ? "text-ink" : "text-ink-dim hover:bg-bg-raised hover:text-ink"
                          }`}
                        >
                          {lang === "ko" ? c.ko : c.en}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lg:hidden" />

        {/* 우: 유틸 — 언어 토글 + 견적요청 CTA(레드 배경 = CTA 전용 허용) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <LangToggle lang={lang} />
          <Link
            href="/support/quote"
            className="hidden h-9 items-center bg-red px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-live sm:inline-flex"
          >
            {lang === "ko" ? "견적요청" : "Quote"}
          </Link>
          {/* 모바일 햄버거 */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            aria-label={lang === "ko" ? (open ? "메뉴 닫기" : "메뉴 열기") : open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3.5 w-5">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-ink transition-transform ${open ? "top-1/2 rotate-45" : ""}`}
              />
              <span className={`absolute left-0 top-1/2 h-px w-full bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span
                className={`absolute bottom-0 left-0 h-px w-full bg-ink transition-transform ${open ? "bottom-1/2 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 드로어 — lenis는 휠만 가로채므로 data-lenis-prevent 필수 */}
      {open && (
        <div
          id="mobile-drawer"
          data-lenis-prevent
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-bg lg:hidden"
        >
          <nav aria-label={lang === "ko" ? "모바일 메뉴" : "Mobile menu"} className="px-5 py-6 pb-safe">
            <ul className="space-y-6">
              {NAV.map((g) => (
                <li key={g.href}>
                  <div className="border-b border-line pb-2 text-[12px] font-medium tracking-[0.12em] text-ink-faint">
                    {lang === "ko" ? g.ko : g.en}
                  </div>
                  <ul className="mt-2">
                    {g.children.map((c) => (
                      <li key={c.href}>
                        <Link
                          href={c.href}
                          className={`block py-2.5 text-[16px] ${pathname === c.href ? "text-ink" : "text-ink-dim"}`}
                        >
                          {lang === "ko" ? c.ko : c.en}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <Link
              href="/support/quote"
              className="mt-8 inline-flex h-11 w-full items-center justify-center bg-red text-[15px] font-semibold text-white"
            >
              {lang === "ko" ? "견적요청" : "Request a Quote"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
