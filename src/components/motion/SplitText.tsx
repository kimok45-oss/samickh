"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPreset } from "./MotionProvider";
import type { PresetName } from "@/lib/motion-presets";

/**
 * 헤드라인을 글자(또는 단어) 단위로 쪼개 마스크 뒤에서 한 조각씩 슬라이드 등장.
 * 출처: 이지스자산운용(SplitType + GSAP) 라이브 관찰을 motion으로 재구성.
 *
 * 원칙(motion-kit 공통):
 * - a11y: 원문을 aria-label에 보존하고, 쪼갠 조각은 전부 aria-hidden. 스크린리더는
 *   통짜 문자열만 읽는다.
 * - reduced-motion: 쪼개지 않고 통짜로 즉시 표시(애니메이션 없음).
 * - SSR 안전: 텍스트는 문자열 prop이라 서버에서도 그대로 렌더(노JS/크롤러에 노출).
 * - 프리셋: 등장 시간/easing/stagger는 MotionProvider 프리셋(subtle/bold)을 따른다.
 *
 * 한글은 음절 1자가 1글자라 by="char"가 자연스럽다(가·나·다 단위). 긴 문장은
 * by="word"가 덜 부담스럽다.
 */
export function SplitText({
  text,
  className,
  by = "char",
  as = "span",
  delay = 0,
  preset,
}: {
  text: string;
  className?: string;
  /** "char"=글자 단위(헤드라인), "word"=단어 단위(긴 문장) */
  by?: "char" | "word";
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  /** 등장 시작 지연(초) */
  delay?: number;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  // reduced-motion: 통짜로 표시(쪼개기·애니메이션 생략)
  if (reduce) {
    const Tag = as as React.ElementType;
    return <Tag className={className}>{text}</Tag>;
  }

  const MotionTag = motion[as] as typeof motion.span;
  // 공백을 보존하면서 토큰화. char 모드는 음절/문자, word 모드는 단어 단위.
  const tokens = by === "word" ? text.split(/(\s+)/) : [...text];
  // 글자 수가 많은 char 모드는 stagger를 촘촘히(전체 길이 폭주 방지)
  const stagger = by === "word" ? p.stagger : Math.min(p.stagger, 0.045);

  const piece: Variants = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: p.duration * 0.8, ease: p.ease } },
  };

  return (
    <MotionTag
      ref={ref as never}
      className={cn("inline-block", className)}
      aria-label={text}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {tokens.map((tok, i) =>
        /^\s+$/.test(tok) ? (
          // 공백은 그대로(줄바꿈 기회 보존)
          <span key={i} aria-hidden>
            {tok}
          </span>
        ) : (
          // 마스크(overflow-hidden) 안에서 조각이 아래→제자리로 슬라이드업
          <span
            key={i}
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
          >
            {/* reveal-rescue: 조각이 마스크 밖(y 110%)에 멈춘 채 영구히 안 보이는 사고 방지.
                하이드레이션 성공 시 html[data-hydrated] 가 꺼서 슬라이드업이 보존된다. */}
            <motion.span className="reveal-rescue inline-block" variants={piece}>
              {tok === " " ? " " : tok}
            </motion.span>
          </span>
        )
      )}
    </MotionTag>
  );
}

export default SplitText;
