"use client";

// 도면 1회 드로잉을 «화면에 들어올 때» 시작시키는 감싸개.
// 2026-10-22 오너 '나머지 다 진행'(전체점검-2026-10-19 SMK-23): 홈 «제작 범위»·«도면과 카탈로그» 도면의
// 1회 그리기(.dwg-draw·.dwg-ink·.dwg-fill, globals.css)가 페이지를 연 순간 시작돼, 방문자가 스크롤해 닿기 전에 끝나 버렸다.
// → 하이드레이션이 끝난 뒤(html[data-hydrated])에만 '대기'로 멈춰 두고, 화면에 들어오면 이어서 그린다.
//
// fail-open: 멈춤 규칙은 html[data-hydrated] 아래에서만 걸린다(globals.css). JS 청크가 죽어 하이드레이션이 안 되면
// 예전처럼 페이지를 연 순간 그려져 최종 모양에 도달한다 — 도면이 투명하게 남는 일은 없다.
// IntersectionObserver 가 없는 브라우저도 바로 그린다. 모양·시간·지연값은 그대로(CSS 소유).
import { useEffect, useRef, useState } from "react";

export default function DrawOnView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPlay(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-dwg={play ? "play" : "wait"}>
      {children}
    </div>
  );
}
