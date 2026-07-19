"use client";

import { createContext, useContext } from "react";
import { MotionConfig } from "motion/react";
import {
  DEFAULT_PRESET,
  getPreset,
  type MotionPreset,
  type PresetName,
} from "@/lib/motion-presets";

/**
 * 전역 모션 설정 + 프리셋 컨텍스트.
 *  - MotionConfig reducedMotion="user" → '동작 줄이기'를 켠 사용자에게
 *    transform/layout 애니메이션을 자동 비활성화(필수 동작만 유지).
 *  - PresetContext → Reveal/Stagger/Magnetic 등이 preset prop 없이도 전역 톤을 소비.
 * 출처: scd-renewal MotionProvider + motion-presets 결합.
 *
 * layout.tsx 최상단을 감싸 사용:
 *   <MotionProvider preset="subtle"> ... </MotionProvider>
 */
const PresetContext = createContext<MotionPreset>(getPreset(DEFAULT_PRESET));

export function useMotionPreset(override?: PresetName): MotionPreset {
  const ctx = useContext(PresetContext);
  return override ? getPreset(override) : ctx;
}

export default function MotionProvider({
  children,
  preset = DEFAULT_PRESET,
}: {
  children: React.ReactNode;
  preset?: PresetName;
}) {
  return (
    <PresetContext.Provider value={getPreset(preset)}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </PresetContext.Provider>
  );
}
