// 공개면 공용 미니 헬퍼 — DB *En 컬럼 폴백 규칙(en이면 *En 우선, 없으면 ko 원문).
// src/lib 은 수정 금지 계약이라 디자인 계층 전용 헬퍼는 여기(components)에 둔다.
import type { Lang } from "@/lib/lang";

/** DB 이중언어 필드 표시값 — en && 값 존재 시 en, 아니면 ko 원문. */
export function tx(lang: Lang, ko: string, en?: string | null): string {
  return lang === "en" && en ? en : ko;
}

/** 페이지 모듈 스코프 {ko,en} 사전 선택. */
export function pick<T>(lang: Lang, dict: { ko: T; en: T }): T {
  return lang === "en" ? dict.en : dict.ko;
}
