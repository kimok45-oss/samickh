"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";

/**
 * Lenis 기반 관성 스크롤. 인스턴스를 window.lenis에 park → 앵커/Button이 scrollTo 요청 가능.
 *  - prefers-reduced-motion 가드: 켜져 있으면 lenis 자체를 생성하지 않음(네이티브 스크롤 유지).
 *  - scrollRestoration="manual": 새로고침 시 중간 위치 복원 방지.
 *  - a[href^="#"] 위임 클릭 → 같은 페이지 앵커 부드러운 이동.
 *  - 라우트 변경 시 상단 리셋(해시 있으면 해당 섹션으로).
 * 출처: hangang119 SmoothScroll(park+가드) + scd-renewal SmoothScroll(앵커 위임+라우트 리셋) 결합.
 *
 * layout에서 한 번만 마운트. 헤더 높이가 다르면 OFFSET 상수를 조정.
 */
const OFFSET = -88;

export default function SmoothScroll() {
  const reduce = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (reduce) return;

    let lenis: Lenis | null = null;
    let raf = 0;

    const start = () => {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });
      lenisRef.current = lenis;
      (window as unknown as { lenis?: Lenis }).lenis = lenis;

      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    // 같은 페이지 내 앵커 링크(#id) 부드러운 이동
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el && lenisRef.current) {
        e.preventDefault();
        lenisRef.current.scrollTo(el as HTMLElement, { offset: OFFSET });
      }
    };

    const t = setTimeout(start, 60);
    document.addEventListener("click", onClick);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      lenisRef.current = null;
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, [reduce]);

  // 라우트 이동 시 상단 리셋(해시 있으면 해당 섹션으로)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash);
        if (el) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el as HTMLElement, { offset: OFFSET, immediate: true });
          } else {
            (el as HTMLElement).scrollIntoView();
          }
          return;
        }
        lenisRef.current?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      });
      return;
    }
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
