// S2 계열 원장 — DB Series 10계열을 괘선 원장(ledger) 리스트로. 카드 그리드 금지(방향서).
// 행: 시리즈코드(mono) · 계열명(+원문 영문) · 압력(seriesCode에서 추출) · 유압/공압 · 마이크로 실사.
import Link from "next/link";
import type { Lang } from "@/lib/lang";

export type SeriesRow = {
  slug: string;
  name: string;
  nameEn: string | null;
  seriesCode: string;
  kind: string; // hydraulic | pneumatic
  thumb: string | null; // SeriesImage sortOrder 0 (배너 우측이 실사 — CSS object-right 크롭)
};

/** seriesCode("SS 70H, SS 140H"·"SM 210H")에서 사용압력 숫자만 추출 — 유압 계열용. */
function pressures(seriesCode: string): number[] {
  const out: number[] = [];
  const re = /(\d+)\s*H/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(seriesCode))) {
    const v = Number(m[1]);
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export default function SeriesLedger({ items, lang }: { items: SeriesRow[]; lang: Lang }) {
  return (
    <ul className="border-t border-line">
      {items.map((s) => {
        const p = s.kind === "hydraulic" ? pressures(s.seriesCode) : [];
        return (
          <li key={s.slug} className="border-b border-line">
            <Link
              href={`/business/${s.slug}`}
              className="group grid grid-cols-[minmax(96px,150px)_1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-bg-raised sm:grid-cols-[170px_1fr_150px_90px_96px] sm:gap-6"
            >
              {/* 시리즈코드 */}
              <span className="tnum font-mono text-[14px] font-semibold text-ink sm:text-[16px]">{s.seriesCode}</span>

              {/* 계열명 — 단일 표기(보조 영문 줄 제거: 직관 우선, 오너 피드백) */}
              <span className="min-w-0">
                <span className="block truncate text-[15px] text-ink group-hover:underline group-hover:underline-offset-4 sm:text-[16px]">
                  {s.name}
                </span>
              </span>

              {/* 압력 — 유압만(공압은 원문에 압력 명기 없음) */}
              <span className="tnum hidden font-mono text-[13px] text-ink-dim sm:block">
                {p.length > 0 ? `${p.join(" / ")} kgf/㎠` : "—"}
              </span>

              {/* 구분 */}
              <span className="hidden text-[12px] text-ink-faint sm:block">
                {s.kind === "hydraulic" ? (lang === "en" ? "Hydraulic" : "유압") : lang === "en" ? "Pneumatic" : "공압"}
              </span>

              {/* 마이크로 실사(원본 배너 우측 크롭) */}
              <span className="hidden h-12 w-24 overflow-hidden border border-line bg-bg-panel sm:block">
                {s.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumb} alt="" loading="lazy" className="h-full w-full object-cover object-right" />
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
