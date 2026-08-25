"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPreset } from "./MotionProvider";
import type { PresetName } from "@/lib/motion-presets";

/**
 * 스크롤 진입 등장 부품 모음. 출처: scd-renewal motion-primitives + hangang119 Reveal.
 * 모든 부품은 MotionProvider의 프리셋(subtle/bold)을 소비하며, `preset` prop으로
 * 개별 오버라이드 가능. blur는 bold 프리셋에서만 적용된다.
 */

/** 스크롤 진입 시 아래에서 페이드업(+옵션 blur). 1회만. */
export function Reveal({
  children,
  className,
  delay = 0,
  y,
  as = "div",
  id,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** 기본은 프리셋 distance. 지정 시 우선. */
  y?: number;
  as?: "div" | "section" | "li" | "span" | "h2" | "p";
  id?: string;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const MotionTag = motion[as] as typeof motion.div;
  const dist = y ?? p.distance;
  const hidden = {
    opacity: 0,
    y: dist,
    ...(p.blur ? { filter: `blur(${p.blur}px)` } : {}),
  };
  const show = {
    opacity: 1,
    y: 0,
    ...(p.blur ? { filter: "blur(0px)" } : {}),
  };
  return (
    <MotionTag
      ref={ref as never}
      id={id}
      // reveal-rescue: JS 청크 실패로 하이드레이션이 죽어도 2.5초 뒤 CSS가 강제로 드러낸다.
      // 하이드레이션 성공 시 html[data-hydrated] 규칙이 꺼서 아래 연출이 그대로 보존된다.
      className={cn(className, "reveal-rescue")}
      initial={hidden}
      animate={inView ? show : undefined}
      transition={{ duration: p.duration, ease: p.ease, delay }}
    >
      {children}
    </MotionTag>
  );
}

/** 자식을 순차 등장시키는 컨테이너. 자식은 <Stagger.Item> 또는 variants 상속. */
export function Stagger({
  children,
  className,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const parent: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: p.stagger, delayChildren: p.delayChildren },
    },
  };
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={parent}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

/** Stagger의 자식 1칸. 부모의 stagger 타이밍을 따라 등장. */
Stagger.Item = function StaggerItem({
  children,
  className,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const child: Variants = {
    hidden: {
      opacity: 0,
      y: p.distance,
      ...(p.blur ? { filter: `blur(${p.blur}px)` } : {}),
    },
    show: {
      opacity: 1,
      y: 0,
      ...(p.blur ? { filter: "blur(0px)" } : {}),
      transition: { duration: p.duration, ease: p.ease },
    },
  };
  return (
    // reveal-rescue: 위 Reveal 과 같은 fail-open 폴백(globals.css).
    <motion.div className={cn(className, "reveal-rescue")} variants={child}>
      {children}
    </motion.div>
  );
};

/**
 * 카운트업 숫자. 뷰포트 진입 시 0 → value.
 * SSR/초기 렌더는 최종값(0 아님) → 크롤러·JS 미실행·SNS 미리보기에서 실제 숫자 노출.
 * 카운트업은 클라이언트 시각효과. reduced-motion이면 즉시 최종값으로 점프.
 */
export function Counter({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "ko-KR",
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const ms = duration * 1000;
    const start = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      setDisplay(value * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const fmt = (n: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={`${prefix}${fmt(value)}${suffix}`}
    >
      <span aria-hidden="true">
        {prefix}
        {fmt(display)}
        {suffix}
      </span>
    </span>
  );
}

/** 마우스 추적 3D 틸트 카드. 세기는 프리셋 pointer를 따른다. */
export function TiltCard({
  children,
  className,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const max = 24 * p.pointer; // 최대 기울기(도)

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn("[transform-style:preserve-3d] will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
