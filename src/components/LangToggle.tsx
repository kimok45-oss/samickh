// 헤더(클라이언트 컴포넌트)에 넣는 KR | EN 토글 + 본문 페이드 로직 — 참조 구현.
// 헤더는 "use client" 이고, 서버 부모((public)/layout.tsx)에서 lang을 prop으로 받는다.
"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Lang } from "@/lib/lang";
import { setLangAction } from "@/lib/lang-actions";

export function LangToggle({ lang = "ko" }: { lang?: Lang }) {
  const [pending, startSwitch] = useTransition();
  const switchingRef = useRef(false);

  // 언어 전환 — 본문 페이드아웃 → 쿠키 교체(RSC 재렌더) → 페이드인. 헤더는 효과 없음.
  const switchLang = (l: Lang) => {
    if (l === lang) return;
    switchingRef.current = true;
    document.documentElement.classList.remove("lang-in");
    document.documentElement.classList.add("lang-out");
    startSwitch(async () => {
      await new Promise((r) => setTimeout(r, 260)); // 페이드아웃 완료 보장
      const fd = new FormData();
      fd.set("lang", l);
      await setLangAction(fd);
    });
  };

  // 교체 완료 시점에 페이드인 재생
  useEffect(() => {
    if (pending || !switchingRef.current) return;
    switchingRef.current = false;
    const root = document.documentElement;
    root.classList.remove("lang-out");
    root.classList.add("lang-in");
    const timer = setTimeout(() => root.classList.remove("lang-in"), 600);
    return () => clearTimeout(timer);
  }, [pending]);

  return (
    <div className="flex items-center gap-2 text-[13px] font-medium">
      {(["ko", "en"] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden className="opacity-30">|</span> : null}
          <button
            type="button"
            onClick={() => switchLang(l)}
            aria-current={lang === l ? "true" : undefined}
            className={lang === l ? "font-semibold" : "opacity-50 hover:opacity-100"}
          >
            {/* ⚠️ "ko".toUpperCase() = "KO" 이므로 한국 관례인 "KR"로 직접 매핑 */}
            {l === "ko" ? "KR" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}
