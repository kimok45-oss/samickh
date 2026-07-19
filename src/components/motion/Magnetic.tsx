"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useMotionPreset } from "./MotionProvider";
import type { PresetName } from "@/lib/motion-presets";

/**
 * 커서 자석 — 자식을 커서 쪽으로 부드럽게 끌어당겼다 떠나면 스프링으로 복귀.
 * 세기는 prop strength > 프리셋 pointer 순으로 결정. reduced-motion이면 비활성.
 * 출처: hangang119 Magnetic.tsx.
 */
export default function Magnetic({
  children,
  className,
  strength,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  /** 0~1, 기본은 프리셋 pointer */
  strength?: number;
  preset?: PresetName;
}) {
  const p = useMotionPreset(preset);
  const s = strength ?? p.pointer;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 160, damping: 14, mass: 0.18 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * s);
    y.set((e.clientY - (r.top + r.height / 2)) * s);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
