// 2026-10-22 오너 '나머지 다 진행'(5-1-1 ① 전화 링크 공용 함수) — location-map 스킬 assets/tel.ts 정본 그대로 옮김.
// 삼익 표기 "053-591-9931~2" → tel:0535919931 (대표 번호만). 푸터·찾아오시는길·홈 견적 상자·문의 꼬리가 함께 쓴다.
// 전화 링크(tel:) 공용 헬퍼 — 정본 manhorope/src/lib/tel.ts (2026-10-21 전체점검-2026-10-19 MH19-21·SHJ-01 수정에서 수확).
// 화면 표기에 범위·여러 번호가 든 경우("051-601-0300~9", "02-3452-8111 · 7121", "043-881-6282 / 031-529-6282")
// 숫자만 남겨 통째로 이어 붙이면 05160103009·023452811171 같은 없는 번호로 걸린다(폰에서만 보이는 고장).
// → 범위·구분 기호(~ · , / | ; 내선·ext) 앞의 첫 번호(대표 번호)만 링크에 쓴다. 화면 표기는 그대로.
// ⚠ 지역번호 괄호 "(02) 758-6600" 는 구분 기호로 보지 않는다(숫자로 그대로 남김). '(' 를 구분 기호에 넣은 판
//   (asiacable src/lib/tel.ts)을 괄호 표기 리포에 옮기면 첫 칸이 비어 링크가 아예 사라진다.
// ⚠ 영문 표기가 "+82-31-488-9966 to 9969" 처럼 'to' 범위면 SEPARATOR 에 `|\s+to\s+` 를 더한다(남영 판).
// 검출: verify-kit trap-scan `tel-range-strip`(T28).
const SEPARATOR = /[~〜～∼·・‧,，/|;]|내선|\bext\.?/i;

/** 첫 번호의 숫자만(맨 앞 + 는 유지). 번호로 볼 수 없으면(7자리 미만) null. */
export function firstTelDigits(v: string | null | undefined): string | null {
  const first = (v ?? "").split(SEPARATOR)[0] ?? "";
  const plus = first.trim().startsWith("+") ? "+" : "";
  const digits = first.replace(/\D/g, "");
  return digits.length >= 7 ? plus + digits : null;
}

/** `tel:` href. 번호로 볼 수 없으면 undefined(링크 없이 글자만). */
export function telHref(v: string | null | undefined): string | undefined {
  const d = firstTelDigits(v);
  return d ? `tel:${d}` : undefined;
}
