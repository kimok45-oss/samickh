/**
 * 모션 프리셋 2종 — 사이트의 "성격"을 한 줄로 결정한다.
 *
 *  - subtle : 은은·고급(기업/IR/B2B). 짧은 이동·미세 페이드·느린 easing.
 *  - bold   : 화려·임팩트(에이전시/포트폴리오). 큰 이동·스태거·sheen 강조.
 *
 * 컴포넌트는 `preset` prop 으로 직접 받거나, MotionProvider의 컨텍스트로
 * 전역 기본값을 소비한다. 토큰만 바꾸면 사이트 전체 톤이 함께 바뀐다.
 */
import { EASE_OUT_EXPO, EASE_OUT_SOFT } from "./anim";

export type PresetName = "subtle" | "bold";

export type MotionPreset = {
  /** reveal/stagger 1개 요소 등장 시간(초) */
  duration: number;
  /** 등장 시 아래에서 올라오는 거리(px) */
  distance: number;
  /** 등장 이징 */
  ease: readonly [number, number, number, number];
  /** Stagger 자식 간 간격(초) */
  stagger: number;
  /** 첫 자식 지연(초) */
  delayChildren: number;
  /** 등장 시작 blur(px) — 0이면 미사용. bold에서 질감 강조 */
  blur: number;
  /** 자석/틸트 등 포인터 인터랙션 세기 배수(0~1) */
  pointer: number;
};

export const PRESETS: Record<PresetName, MotionPreset> = {
  subtle: {
    duration: 0.8,
    distance: 18,
    ease: EASE_OUT_EXPO,
    stagger: 0.08,
    delayChildren: 0.04,
    blur: 0,
    pointer: 0.22,
  },
  bold: {
    duration: 0.95,
    distance: 44,
    ease: EASE_OUT_SOFT,
    stagger: 0.12,
    delayChildren: 0.06,
    blur: 8,
    pointer: 0.4,
  },
};

/** 전역 기본 프리셋. 프로젝트에서 이 한 줄만 바꾸면 된다. */
export const DEFAULT_PRESET: PresetName = "subtle";

export function getPreset(name: PresetName = DEFAULT_PRESET): MotionPreset {
  return PRESETS[name];
}
