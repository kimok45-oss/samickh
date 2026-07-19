"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/anim";

/**
 * 인트로 커튼 스플래시 — 화면을 덮은 뒤 로고가 등장하고 커튼이 걷히며 홈을 드러냄.
 *  - 세션당 1회만(sessionStorage 플래그). reduced-motion이면 즉시 제거.
 *  - 첫 렌더(SSR 포함)부터 'cover'로 화면을 덮어 홈이 먼저 깜빡이는 플래시 방지.
 *  - intro-lock: <html>에 클래스 추가로 바디 스크롤 잠금(globals.append.css의 .mk-intro-lock).
 *  - 안전장치: done 후 1s 뒤 하드 unmount → reduced-motion에서 exit가 안 끝나
 *    오버레이가 잔존해 클릭을 막는 버그 방지.
 * 출처: scd-renewal SplashScreen(페이즈/락) + hangang119 INTRO(타임라인) + 문배 sheen 결합.
 *
 * 로고는 brand-free로 children 슬롯에 넣는다:
 *   <Splash><img src="/brand/logo.svg" alt="회사명" className="h-12" /></Splash>
 */
export default function Splash({
  children,
  storageKey = "mk_splash",
  /** 커버~커튼 유지 시간(ms) */
  holdMs = 2200,
  /** ?intro 쿼리로 강제 재생(개발용) */
  forceParam = "intro",
}: {
  children?: React.ReactNode;
  storageKey?: string;
  holdMs?: number;
  forceParam?: string;
}) {
  const [phase, setPhase] = useState<"cover" | "play" | "done">("cover");
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).has(forceParam);
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!force && (reduced || sessionStorage.getItem(storageKey))) {
      sessionStorage.setItem(storageKey, "1");
      setPhase("done");
      return;
    }
    sessionStorage.setItem(storageKey, "1");
    setPhase("play");
    document.documentElement.classList.add("mk-intro-lock");
    window.scrollTo(0, 0);
    const t = setTimeout(() => setPhase("done"), holdMs);
    return () => clearTimeout(t);
  }, [storageKey, holdMs, forceParam]);

  useEffect(() => {
    if (phase !== "done") return;
    document.documentElement.classList.remove("mk-intro-lock");
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  if (gone) return null;

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[var(--mk-splash-bg,#fff)]"
          initial={{ opacity: 1 }}
          exit={
            phase === "play"
              ? { opacity: 0, scale: 1.05, filter: "blur(6px)" }
              : { opacity: 0 }
          }
          transition={{ duration: phase === "play" ? 0.8 : 0.15, ease: EASE_OUT_EXPO }}
        >
          {phase === "play" && (
            <>
              {/* 로고 락업: 살짝 옆에서 들어오며 안착 */}
              <motion.div
                className="relative flex items-center gap-3"
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.85, ease: EASE_OUT_EXPO }}
              >
                {children}
                {/* 로고 위로 스쳐가는 sheen 한 줄(문배 Steel sheen) */}
                <span className="mk-splash-sheen pointer-events-none absolute inset-0" />
              </motion.div>

              {/* 하단 로딩 바 */}
              <motion.div
                className="absolute bottom-16 left-1/2 h-0.5 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.span
                  className="block h-full w-full origin-left bg-[var(--mk-accent,#222)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: (holdMs - 600) / 1000, ease: "easeInOut" }}
                />
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
