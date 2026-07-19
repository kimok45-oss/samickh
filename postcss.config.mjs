// Tailwind v4 — 이 파일이 없으면 @import "tailwindcss"·@theme 가 전혀 컴파일되지 않는다
// (CSS 변수 빈값·유틸 클래스 무효·폰트 폴백). Phase 1 부트스트랩에서 반드시 함께 복사.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
