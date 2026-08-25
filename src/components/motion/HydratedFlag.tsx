"use client";

import { useEffect } from "react";

/**
 * fail-open 스위치(2026-08-26). 하이드레이션이 실제로 끝나면 <html>에 data-hydrated 를 심는다.
 *
 * 등장 프리미티브(Reveal/Stagger.Item/SplitText)는 SSR HTML에 opacity:0(±transform)을
 * 인라인으로 남긴다. 모바일에서 JS 청크가 하나라도 못 받아지면 하이드레이션이 죽고
 * 그 인라인 스타일이 영구히 남아 — 콘텐츠가 영원히 투명해진다.
 *
 * 그래서 globals.css 의 .reveal-rescue 가 2.5초 뒤 CSS 애니메이션으로 강제로 드러내고,
 * 이 플래그가 붙으면(=하이드레이션 성공) 그 rescue 를 꺼서 원래 스크롤 연출을 보존한다.
 * 공개면 루트 레이아웃에 한 번만 마운트한다.
 */
export default function HydratedFlag() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);
  return null;
}
