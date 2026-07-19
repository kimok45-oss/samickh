// 주문방법 스테이션 — 순수 계산/포맷 헬퍼.
// 근거: 원본 카탈로그 p.11 "실린더 주문방법"(①패킹재질~⑩리드스위치) + 사실대장 §5b.
// 이론 출력 押 F=P×A, 引 F=P×(A−a) — "이론 출력(계산식)" 라벨과 함께만 표시한다.
import type { Lang } from "@/lib/lang";

export type BoreRow = { code: string; bore: number; rodB: number; rodC: number };
export type MountRow = { code: string; name: string; nameEn: string | null };

export type SeriesKey = "70H" | "140H";
export type RodSeries = "B" | "C";
export type Cushion = "N" | "R" | "H" | "B";
export type Packing = "1" | "2" | "3";

/** 시리즈 표기 — SS 70H / SS 140H, 리드스위치(⑩) 체크 시 70HL/140HL. */
export function seriesLabel(series: SeriesKey, hl: boolean): string {
  return `SS ${series === "70H" ? "70H" : "140H"}${hl ? "L" : ""}`;
}

/** 사용압력(kgf/㎠) — 시리즈에 따름(70/140). */
export function seriesPressure(series: SeriesKey): number {
  return series === "70H" ? 70 : 140;
}

/** 선택 보어의 롯드경(mm) — B/C계열. */
export function rodDia(bore: BoreRow, rod: RodSeries): number {
  return rod === "B" ? bore.rodB : bore.rodC;
}

/** 이론 출력(계산식): 押 F=P×A, 引 F=P×(A−a). 단위 kgf (P: kgf/㎠, 지름: mm). */
export function theoreticalForce(pressure: number, boreMm: number, rodMm: number) {
  const areaCm2 = (Math.PI / 4) * Math.pow(boreMm / 10, 2);
  const rodAreaCm2 = (Math.PI / 4) * Math.pow(rodMm / 10, 2);
  return {
    push: pressure * areaCm2,
    pull: pressure * (areaCm2 - rodAreaCm2),
    areaCm2,
    rodAreaCm2,
  };
}

export function fmtKgf(v: number): string {
  return Math.round(v).toLocaleString("en-US");
}

export function fmtTon(v: number): string {
  const t = v / 1000;
  return t >= 100 ? t.toFixed(0) : t >= 10 ? t.toFixed(1) : t.toFixed(2);
}

export type ModelSlot = {
  value: string;
  labelKo: string;
  labelEn: string;
};

/**
 * 형번 슬롯 — 원문 주문방법 순서:
 * [시리즈] - ①패킹재질 - ②지지부형식 - ③실린더내경 - ④롯드계열 - ⑤스트로크 - ⑥쿠션유무 - ⑦포트위치 - ⑧쿠션밸브위치 - ⑨벨로우즈
 * ⑩리드스위치는 시리즈 표기(HL)에 포함된다(원문 좌측 시리즈 박스 4종).
 * ⑦포트위치 표준 A · ⑧쿠션밸브위치 표준 B · ⑨벨로우즈 무부착 N (원문 표준값).
 */
export function modelSlots(opts: {
  series: SeriesKey;
  hl: boolean;
  packing: Packing;
  mounting: string;
  boreCode: string;
  rodSeries: RodSeries;
  stroke: number;
  cushion: Cushion;
}): ModelSlot[] {
  return [
    { value: seriesLabel(opts.series, opts.hl), labelKo: "시리즈(⑩리드스위치)", labelEn: "Series (⑩ lead switch)" },
    { value: opts.packing, labelKo: "①패킹재질", labelEn: "① Packing" },
    { value: opts.mounting, labelKo: "②지지부형식", labelEn: "② Mounting" },
    { value: opts.boreCode, labelKo: "③실린더내경", labelEn: "③ Bore" },
    { value: opts.rodSeries, labelKo: "④롯드계열", labelEn: "④ Rod series" },
    { value: `${opts.stroke}ST`, labelKo: "⑤스트로크", labelEn: "⑤ Stroke" },
    { value: opts.cushion, labelKo: "⑥쿠션유무", labelEn: "⑥ Cushion" },
    { value: "A", labelKo: "⑦포트위치", labelEn: "⑦ Port pos." },
    { value: "B", labelKo: "⑧쿠션밸브위치", labelEn: "⑧ Cushion valve" },
    { value: "N", labelKo: "⑨벨로우즈", labelEn: "⑨ Bellows" },
  ];
}

/** 형번 문자열(견적 프리필용) — 슬롯을 " - "로 연결. */
export function modelCode(slots: ModelSlot[]): string {
  return slots.map((s) => s.value).join(" - ");
}

/** 쿠션 코드 원문 명칭(p.11 ⑥). */
export const CUSHION_LABELS: Record<Cushion, { ko: string; en: string }> = {
  N: { ko: "쿠션없음", en: "No cushion" },
  R: { ko: "롯드측 쿠션", en: "Rod side cushion" },
  H: { ko: "헤드측 쿠션", en: "Head side cushion" },
  B: { ko: "양쪽 쿠션", en: "Both sides cushion" },
};

/** 패킹재질 원문 명칭(p.11 ①). 2 = 표준규격품. */
export const PACKING_LABELS: Record<Packing, { ko: string; en: string }> = {
  "1": { ko: "니트릴 고무", en: "Nitrile rubber" },
  "2": { ko: "우레탄 고무 (표준규격품)", en: "Urethane rubber (standard)" },
  "3": { ko: "불소 고무", en: "Fluoro rubber" },
};

export function langPick(lang: Lang, ko: string, en: string): string {
  return lang === "en" ? en : ko;
}
