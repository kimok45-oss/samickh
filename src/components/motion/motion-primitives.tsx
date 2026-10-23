"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";
import { useMotionPreset } from "./MotionProvider";
import type { PresetName } from "@/lib/motion-presets";

/**
 * 모션 부품 모음. 출처: scd-renewal motion-primitives + hangang119 Reveal.
 * 2026-10-22 부터 Reveal·Stagger 는 정지(아래 주석). Counter·TiltCard 는 그대로다(지금 이 리포에서 쓰는 곳 없음).
 */

/**
 * 2026-10-22 오너 '나머지 다 진행'(1-3-2 본문 페이드업 걷어내기 · 전체점검-2026-10-19 SMK-18):
 * 본문은 정지가 기본이다. Reveal·Stagger 는 이제 연출 없이 그 자리에 그대로 그린다
 * (SSR HTML 에 opacity:0 을 심지 않으므로 JS 가 늦거나 죽어도 글이 늦게 뜨지 않는다).
 * 호출부(홈·사업분야·회사소개·주문방법 약 24곳)를 건드리지 않으려고 이름·props(delay·y·preset)는 그대로 받고 무시한다
 * — 되돌릴 때는 이 파일만 바꾸면 된다.
 * fail-open 체계(HydratedFlag + globals.css .reveal-rescue)는 그대로 둔다. 이제 숨겼다가 보여 줄 것이 없어
 * 안전망이 할 일은 없지만, 다시 연출을 켜는 부품이 생겨도 안전망이 남는다.
 * 홈 도면 1회 드로잉(.bore-draw·.dwg-*)은 시그니처 연출이라 그대로다(CSS 전용).
 */
export function Reveal({
  children,
  className,
  as = "div",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  /** 2026-10-22 이후 무시(정지) — 호출부 호환용 */
  delay?: number;
  /** 2026-10-22 이후 무시(정지) — 호출부 호환용 */
  y?: number;
  as?: "div" | "section" | "li" | "span" | "h2" | "p";
  id?: string;
  /** 2026-10-22 이후 무시(정지) — 호출부 호환용 */
  preset?: PresetName;
}) {
  const Tag = as;
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}

/** 자식 묶음 컨테이너 — 2026-10-22 이후 순차 등장 없이 정지(1-3-2). */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: PresetName;
}) {
  return <div className={className}>{children}</div>;
}

/** Stagger의 자식 1칸 — 2026-10-22 이후 정지(1-3-2). */
Stagger.Item = function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: PresetName;
}) {
  return <div className={className}>{children}</div>;
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
