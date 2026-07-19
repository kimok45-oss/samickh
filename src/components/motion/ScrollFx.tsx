"use client";

import { useEffect } from "react";

/**
 * CSS-클래스 기반 스크롤 인터랙션 — motion 컴포넌트 없이 마크업에 속성만 붙이면 동작.
 *  - [data-reveal]      : 뷰포트 진입 시 .in 추가 → CSS로 페이드업(globals.append.css).
 *  - [data-reveal] style="--rd:120ms" : 등장 지연(stagger 흉내).
 *  - [data-plx="0.3"]   : 패럴랙스 — 스크롤에 따라 translateY.
 *  - MutationObserver   : HMR/클라이언트 네비게이션 후 추가된 요소도 계속 관찰
 *                         (요소가 투명 상태로 방치되지 않게 — 가장 흔한 함정).
 * 출처: 문배철강 ScrollFx.tsx.
 *
 * 서버 컴포넌트(많은 정적 섹션)에 모션을 입힐 때 유용 — Reveal로 일일이 감쌀 필요 없음.
 * layout이나 페이지 루트에 한 번 마운트.
 */
export default function ScrollFx() {
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const seen = new WeakSet<Element>();
    let plxEls: HTMLElement[] = [];

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );

    const collect = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) {
          el.classList.add("in"); // reduced-motion: 즉시 표시
          return;
        }
        // 이미 스크롤로 지나친 요소는 즉시 표시(스크롤 복원·네비게이션 복귀 대비)
        if (el.getBoundingClientRect().bottom < 0) {
          el.classList.add("in");
          return;
        }
        io.observe(el);
      });
      plxEls = reduce ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-plx]"));
    };

    let raf = 0;
    const tick = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of plxEls) {
        const s = parseFloat(el.dataset.plx ?? "0.3");
        const r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) continue;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${(-p * s * 100).toFixed(1)}px, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    collect();
    tick();

    const mo = new MutationObserver(() => {
      collect();
      onScroll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
