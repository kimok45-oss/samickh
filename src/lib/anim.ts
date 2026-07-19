/**
 * 공유 애니메이션 타이밍/이징 토큰.
 * 인트로(스플래시)와 등장 애니메이션이 같은 매직넘버를 공유하도록 한 곳에 모은다.
 * 출처: hangang119 src/lib/anim.ts 를 일반화(브랜드 비종속).
 */

// "제자리에 안착하는" 프리미엄 이징 — slow-out. 사이트 전반에 사용.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** 인트로/스플래시 타임라인(초). 히어로 등장은 curtain에 맞춰 키온한다. */
export const INTRO = {
  /** 심볼 마크가 페이드/스케일 인 */
  symbol: 0.15,
  /** 워드마크가 옆에서 펼쳐짐 */
  wordmark: 0.95,
  /** 완성된 로고를 잠시 유지 */
  hold: 1.7,
  /** 커튼이 걷히며 홈을 드러냄 */
  curtain: 2.05,
  /** 프리로더 완전 언마운트 / 스크롤 잠금 해제 */
  done: 2.95,
} as const;

/** 스크롤 트리거 콘텐츠용 표준 reveal variants. */
export const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_OUT_EXPO },
  },
};

export const revealStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};
