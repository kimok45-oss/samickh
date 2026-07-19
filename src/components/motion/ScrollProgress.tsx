"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * 페이지 상단 스크롤 진행률 바. 색은 CSS 변수(--mk-accent)로 브랜드 비종속.
 * 출처: scd-renewal ScrollProgress.tsx.
 * layout 상단에 한 번 마운트.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[var(--mk-accent,#222)]"
    />
  );
}
