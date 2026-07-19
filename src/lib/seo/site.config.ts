// src/lib/seo/site.config.ts — 사이트 전역 SEO 설정의 "단일 진실원천(편집은 여기서만)".
//
// 값 출처: Desktop\일정\samickh-clone\사실대장.md — 원문에 없는 사실은 넣지 않는다(날조 금지).
// 비상장(DART 무등록) → Organization 타입, ticker 없음. 이메일은 원문 부재 → 미기재.

/** 배포 도메인(프로토콜 포함, 끝 슬래시 없음). env 우선, 폴백은 dev 고정 포트(5700). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:5700";

export const SITE = {
  /** 회사명(title 템플릿·OG siteName) */
  name: "삼익유공압",
  /** <title> 기본값(홈/직접 진입 시) */
  titleDefault: "삼익유공압주식회사 | 유압·공압 실린더 제조",
  /** 개별 페이지 title 템플릿 */
  titleTemplate: "%s | 삼익유공압주식회사",
  /** 검색 스니펫/OG 설명 — 사실대장 §1·§5 실측만 */
  description:
    "삼익유공압주식회사(SAMICK H&P)는 1987년 삼익 THK에서 유공압 실린더 제작을 시작해 1998년 분사한 유압·공압 실린더 제조 기업입니다. 표준 유압실린더부터 제철용 강력 실린더까지 주문 제작합니다.",
  /** 대표 OG 이미지(1200×630) — scripts/gen-og.mjs 로 생성한 정적 PNG */
  ogImage: "/og.png",
  locale: "ko_KR",
  altLocales: ["en_US"] as string[],
  keywords: ["삼익유공압", "SAMICK H&P", "유압실린더", "공압실린더", "유공압 실린더", "실린더 제작", "대구 달성"],
} as const;

/** 검색엔진 소유확인 토큰 — 발급 후 채운다(빈 문자열이면 meta 미출력). */
export const VERIFICATION = {
  google: "",
  naver: "",
  bing: "",
} as const;

/** JSON-LD Organization 용 회사 식별 정보(사실대장 값만 — 이메일 없음·비상장). */
export const ORG = {
  legalName: "삼익유공압주식회사",
  /** 원본 CI 로고(수확본) */
  logo: "/uploads/orig/brand/logo.gif",
  type: "Organization" as "Corporation" | "Organization",
  tickerSymbol: "",
  /** 1998 삼익유공압(주)으로 분사(사실대장 §1) */
  foundingDate: "1998",
  telephone: "+82-53-591-9931",
  faxNumber: "+82-53-591-9944",
  address: {
    streetAddress: "구지면 내리 852-5 달성2차산업단지 28블럭 6롯트",
    addressLocality: "달성군",
    addressRegion: "대구광역시",
    postalCode: "", // [확인필요] 원문 부재 — 빈 값이면 JSON-LD에서 생략
    addressCountry: "KR",
  },
  sameAs: [] as string[],
} as const;
