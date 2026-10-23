// S2 계열 원장 — DB Series 10계열을 괘선 원장(ledger) 리스트로. 카드 그리드 금지(방향서).
// 행: 계열명(주인공) · 시리즈코드(mono, 조연) · 압력(seriesCode에서 추출) · 외형 도면(판화 크기).
// 위계 원칙(오너 피드백 2026-08-25 "일반인 눈에 안 읽힌다"): 사람 말이 먼저·굵게, 형번 암호는 뒤로·가늘게.
// 입체 원칙(오너 피드백 2026-08-25 "입체감이 없다"): ①도면을 도판 크기로 키워 잉크가 행 괘선을 넘나들게(레이어)
// ②유압/공압을 굵은 괘선 그룹으로 분리(단층) — 그룹 캡션이 구분 열을 대신하므로 유압/공압 열은 제거.
import Link from "next/link";
import type { Lang } from "@/lib/lang";

// 원본 business{n}_2.gif(계열별 외형 도면)에서 액자·그라데이션을 걷어낸 투명 PNG(/img/series).
// 구 실사 배너 크롭은 2000년대 카탈로그 잔상(파란 방사 배경·잘린 글자)이라 원장에서 퇴출 — 오너 확정 2026-08-25.
// 관리자가 새 계열을 추가하면 도면이 없으므로 thumb(대표 이미지)로 폴백.
const DRAWINGS = new Set([
  "ss-standard",
  "ss-leadswitch",
  "sl-position",
  "sm-square-mill",
  "sm-round-mill",
  "sh-vehicle",
  "st-telescopic",
  "sr-ram",
  "ss-pneumatic",
  "ss-largebore",
]);

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
  const groups = [
    { key: "hydraulic", ko: "유압", en: "HYDRAULIC" },
    { key: "pneumatic", ko: "공압", en: "PNEUMATIC" },
  ]
    .map((g) => ({ ...g, rows: items.filter((s) => s.kind === g.key) }))
    .filter((g) => g.rows.length > 0);

  return (
    <div>
      {groups.map((g, gi) => (
        <section key={g.key} className={gi > 0 ? "mt-12" : undefined}>
          {/* 그룹 캡션 — 굵은 괘선이 원장의 단층을 만든다 */}
          <div className="flex items-baseline justify-between border-t-2 border-ink pb-2 pt-2.5">
            <span className="text-[13px] font-semibold tracking-[0.08em] text-ink">
              {lang === "en" ? g.en : g.ko}
            </span>
            <span className="tnum font-mono text-[12px] text-ink-faint">
              {lang === "en" ? `${g.rows.length} series` : `${g.rows.length}계열`}
            </span>
          </div>

          <ul>
            {g.rows.map((s) => {
              const p = s.kind === "hydraulic" ? pressures(s.seriesCode) : [];
              return (
                <li key={s.slug} className="border-b border-line">
                  <Link
                    href={`/business/${s.slug}`}
                    className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-colors hover:bg-bg-raised sm:grid-cols-[1fr_150px_130px_288px] sm:gap-6"
                  >
                    {/* 계열명 — 주인공(단일 표기, 보조 영문 줄 제거: 직관 우선, 오너 피드백) */}
                    <span className="min-w-0">
                      <span className="block truncate text-[15.5px] font-medium text-ink group-hover:underline group-hover:underline-offset-4 sm:text-[17px]">
                        {s.name}
                      </span>
                    </span>

                    {/* 시리즈코드 — 조연(모노는 여기만) */}
                    <span className="tnum font-mono text-[12.5px] text-ink-dim sm:text-[13.5px]">{s.seriesCode}</span>

                    {/* 압력 — 유압만(공압은 원문에 압력 명기 없음) */}
                    <span className="tnum hidden text-[13.5px] text-ink-dim sm:block">
                      {p.length > 0 ? `${p.join(" / ")} kgf/㎠` : "—"}
                    </span>

                    {/* 외형 도면 — 도판 크기. 음수 마진으로 행 높이를 안 키우고, 큰 도판은 위아래 괘선에 꽉 차게.
                        2026-10-22 오너 '나머지 다 진행'(전체점검-2026-10-19 SMK-22): 폰에서 숨기던 도면을 줄 아래 작게(높이 48px) 보인다.
                        데스크톱(sm 이상)은 예전 그대로(sm:-my-4 가 폰용 mt-1 을 덮어 위아래 -16px — 줄 97px, 도판이 괘선에 꽉 참). */}
                    {DRAWINGS.has(s.slug) ? (
                      <span className="relative z-[1] col-span-2 mt-1 block h-12 w-full sm:col-span-1 sm:-my-4 sm:h-24 sm:w-72">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/img/series/${s.slug}.png`}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain object-left opacity-85 transition-opacity group-hover:opacity-100 sm:object-right"
                        />
                      </span>
                    ) : (
                      <span className="hidden h-14 w-32 justify-self-end overflow-hidden border border-line bg-bg-panel sm:block">
                        {s.thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.thumb} alt="" loading="lazy" className="h-full w-full object-cover object-right" />
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
