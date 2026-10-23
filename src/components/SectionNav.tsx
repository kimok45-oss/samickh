"use client";

// 섹션 서브내비(회사소개·제품소개 등) — 괘선 탭. 활성 판정 때문에 클라이언트.
// 2026-10-22 오너 '나머지 다 진행'(전체점검-2026-10-19 SMK-16): 폰에서 탭 줄이 화면보다 넓으면 현재 탭
// (예: 찾아오시는길)이 오른쪽 밖에 숨어 있었다 → 열릴 때 현재 탭이 보이도록 탭 줄만 가로로 옮긴다
// (페이지 세로 위치는 건드리지 않는다 — scrollIntoView 대신 scrollLeft 만). 데스크톱은 넘치지 않아 변화 없음.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function SectionNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;
    // 탭 줄 안에서의 위치(offsetLeft 는 기준 부모가 body 라 쓰지 않는다)
    const x = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    const left = x - (nav.clientWidth - active.offsetWidth) / 2;
    nav.scrollLeft = Math.max(0, Math.min(left, nav.scrollWidth - nav.clientWidth));
  }, [pathname]);

  return (
    <nav ref={navRef} className="overflow-x-auto border-b border-line" aria-label="Section">
      <ul className="flex min-w-max gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative block whitespace-nowrap px-4 py-3 text-[13.5px] transition-colors ${
                  active ? "text-ink" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {it.label}
                {active && <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-red-live" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
