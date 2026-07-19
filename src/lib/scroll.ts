import type Lenis from "lenis";

/**
 * 섹션을 부드럽게 화면에 가져온다. 고정 헤더 높이만큼 offset 보정.
 * window.lenis 가 있으면 lenis로, 없으면 네이티브 smooth로 폴백.
 * 출처: hangang119 src/lib/scroll.ts.
 *
 * @param id     대상 엘리먼트 id
 * @param offset 음수면 헤더 높이만큼 위로 보정(기본 -92, 헤더 높이에 맞게 조정).
 */
export function scrollToId(id: string, offset = -92) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = (window as unknown as { lenis?: Lenis }).lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.2 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}
