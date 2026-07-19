"use client";

import { useEffect, useState } from "react";

/**
 * 스크롤을 내리면 우하단에 나타나는 '맨 위로' 버튼. opacity/transform만 사용(저부하).
 * 색은 CSS 변수(--mk-ink / --mk-ink-fg / --mk-line)로 브랜드 비종속.
 * window.lenis 가 있으면 lenis로, 없으면 네이티브 smooth로 상단 이동.
 * 출처: 문배철강 ScrollTopButton.tsx.
 */
export default function ScrollTopButton({ threshold = 600 }: { threshold?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setShow(window.scrollY > threshold);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  const toTop = () => {
    const lenis = (window as unknown as { lenis?: { scrollTo: (t: number) => void } }).lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={toTop}
      className={`fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-full border border-[var(--mk-line)] bg-[var(--mk-ink)] text-[var(--mk-ink-fg)] backdrop-blur transition-[opacity,transform] duration-300 ease-out md:bottom-7 md:right-7 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M7 12V2M7 2L2.5 6.5M7 2l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
