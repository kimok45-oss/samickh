// KST 날짜 표시 단일 경로 — toISOString 직접 표시 금지(하루 밀림 방지)
const KST = "Asia/Seoul";

export function fmtDate(d: Date | string | null | undefined, lang: "ko" | "en" = "ko"): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function fmtDateTime(d: Date | string | null | undefined, lang: "ko" | "en" = "ko"): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** datetime-local 입력값(관리자 편집폼)용 — KST 기준 yyyy-MM-ddTHH:mm (되먹임 밀림 방지) */
export function toKstInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}
