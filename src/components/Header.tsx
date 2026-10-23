"use client";

// 공개면 헤더 — 3분할(로고 좌 · GNB 중앙 · 유틸 우) + 견적요청 CTA 상시 + LangToggle.
// GNB = 원본 IA 유지: 회사소개 / 사업분야 / 제품소개 / 고객지원 / 커뮤니티.
// 자유게시판·QNA·FAQ는 메뉴에 넣지 않는다(빈 게시판 — BUILD-CONTRACT).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const activeTop = topOf(pathname);
  const drawerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // SSR/하이드레이션 안전 — 드로어 portal은 클라이언트 마운트 후에만
  useEffect(() => setMounted(true), []);

  // 라우트가 바뀌면 모바일 드로어 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 드로어 열림 동안: 배경 스크롤 잠금 + Esc 닫기 + 초점 가둠(다른 리뉴얼과 통일)
  // ⚠ Lenis 사이트라 body overflow:hidden 만으론 배경이 밀린다(Lenis 가 rAF 로 스크롤을 굴림).
  //    딤 없는 top-16 패널이라 헤더 영역도 노출되므로, 위치 무관하게 lenis.stop() 으로 전면 차단.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();

    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !drawer?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis?.start();
      buttonRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/92 backdrop-blur-md">
      {/* 2026-10-22 오너 '나머지 다 진행'(5-1-1 ②): 폰 '문의' 버튼이 들어가며 폰에서만 칸 간격·로고 높이를 조금 줄임(데스크톱 그대로) */}
      <div className="mx-auto grid h-[68px] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-2 px-5 sm:gap-4 md:px-8">
        {/* 좌: 로고(원본 CI 이미지 이식 — samickh.co.kr /images/common/logo.gif) */}
        {/* 2026-10-22 오너 '나머지 다 진행'(함께 발견한 고장): 좁은 폭에서 로고가 가로로 찌그러지던 것 — 비율 유지(object-contain) */}
        <Link href="/" className="flex min-w-0 items-center" aria-label={lang === "ko" ? "삼익유공압주식회사 홈" : "SAMICK H&P home"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/orig/brand/logo.png"
            alt={lang === "ko" ? "삼익유공압주식회사 SAMICK H&P" : "SAMICK H&P"}
            width={231}
            height={47}
            className="h-9 w-auto max-w-full object-contain object-left min-[390px]:h-10 sm:h-11"
          />
        </Link>

        {/* 중앙: GNB (데스크톱)
            2026-10-22 오너 '나머지 다 진행'(함께 발견한 고장): 768~1023px 에서 GNB 5메뉴가 들어오며 로고가 0~155px 로
            눌려 사라졌다 → GNB 는 1024px 이상(lg)에서만, 그 아래는 햄버거 메뉴(드로어가 원래 lg 미만 전용). */}
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
        <div className="flex items-center justify-end gap-2 min-[390px]:gap-3 sm:gap-4">
          <LangToggle lang={lang} />
          {/* 2026-10-22 오너 '나머지 다 진행'(5-1-1 ② 폰 머리 '문의' 버튼): 폰(640px 미만)에서는 아래 견적요청 버튼이 숨어
              메뉴를 펼쳐야만 견적·문의로 갈 수 있었다 — 같은 레드 CTA 를 작게(높이 32px) 햄버거 옆에. 데스크톱 머리는 그대로. */}
          <Link
            href="/support/quote"
            className="inline-flex h-8 items-center bg-red px-3 text-[12.5px] font-semibold text-white transition-colors hover:bg-red-live sm:hidden"
          >
            {lang === "ko" ? "문의" : "Quote"}
          </Link>
          <Link
            href="/support/quote"
            className="hidden h-9 items-center bg-red px-4 text-[13px] font-semibold text-white transition-colors hover:bg-red-live sm:inline-flex"
          >
            {lang === "ko" ? "견적요청" : "Quote"}
          </Link>
          {/* 모바일 햄버거 */}
          <button
            ref={buttonRef}
            type="button"
            // 2026-10-22(함께 발견한 고장): 드로어는 lg 미만 전용인데 버튼은 데스크톱에도 보여, 누르면 아무것도 안 뜬 채
            // 스크롤만 잠겼다(body overflow hidden + lenis.stop) → 버튼도 lg 미만에서만.
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

      {/* 모바일 드로어 — lenis는 휠만 가로채므로 data-lenis-prevent 필수.
          헤더의 backdrop-blur가 fixed 자식의 컨테이닝 블록을 가로채(top-16/bottom-0가
          뷰포트가 아닌 헤더 박스 기준이 됨) 드로어가 찌그러지므로 body로 portal 한다. */}
      {open && mounted && createPortal(
        <div
          id="mobile-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={lang === "ko" ? "메뉴" : "Menu"}
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
        </div>,
        document.body
      )}
    </header>
  );
}
