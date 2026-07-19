"use client";

import { useEffect, useState } from "react";

/**
 * 가벼운 인트로 — 화면을 덮지 않고, 이미 보이는 본문 위로 얇은 반사광(sheen)이
 * 딱 한 번 스쳐 지나간다. Splash(커튼)보다 은은한 대안 — 콘텐츠가 즉시 보이므로
 * LCP/SEO에 유리. 세션 1회 · reduced-motion 제외 · ?intro 강제 재생.
 * 출처: 문배철강 IntroReveal.tsx 를 일반화(globals.append.css의 .mk-intro-reveal).
 *
 * Splash와 IntroReveal 중 하나만 쓴다(둘 다 인트로).
 */
export default function IntroReveal({
  storageKey = "mk_intro",
}: {
  storageKey?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).has("intro");
    if (!force) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, "1");
    }
    setShow(true);
    // 안전 폴백: animationend가 안 와도 제거(레이어 잔존 방지)
    const t = setTimeout(() => setShow(false), 1320);
    return () => clearTimeout(t);
  }, [storageKey]);

  if (!show) return null;

  return (
    <div
      className="mk-intro-reveal"
      aria-hidden
      onAnimationEnd={(e) => {
        if (e.animationName === "mk-intro-fade-out") setShow(false);
      }}
    >
      <span className="mk-intro-reveal__sheen" />
    </div>
  );
}
