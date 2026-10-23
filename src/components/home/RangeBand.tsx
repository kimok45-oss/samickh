// 홈 S4 «제작 범위» — 형번 스테이션(S3) 뒤에서 제작 한계를 도면 문법으로 못박는 밴드.
//
// 왜 있나: 이 회사는 실사가 0장이라 페이지를 받쳐줄 무게가 없다. 사진을 흉내 내지 않고
// 회사가 실제로 소유한 것 — 도면과 치수 — 으로 무게를 만든다.
// 장치: ① 치수선 그래픽(도면 시그니처의 연장) ② 대형 숫자 ③ 배경 전환(도면지 위 흰 시트 한 장).
//
// 사실 출처(전부 기존 페이지·카탈로그 실측 원문 그대로 — 새 수치 없음):
//   보어 Ø40–Ø800 · 행정 2,000mm · 1987년부터 — 홈 히어로 heroFact
//   표준 내경 13단 Ø40–Ø250, 특주 Ø800 — 홈 히어로 heroCaption(카탈로그 p.11)
//   10계열(유압 8 · 공압 2) — DB Series
//
// 문구 소유권: 이 섹션의 UI 문구는 전부 아래 T 하나가 소유한다(리포 관례 — src/lib/i18n.ts 주석 참조).
//
// 2026-10-22 오너 '나머지 다 진행':
//  · SMK-21 — '최대 행정 2,000mm'는 원문과 어긋남(원문: 스트로크 한계 2,000mm, 그 이상은 특주 — 단 좌굴강도 이하).
//    → '행정 한계 2,000mm · 그 이상 특주'로. 사실대장 "스트로크 한계 | 2,000mm (특주: 2,000mm 이상 — 좌굴강도 이하)".
//  · 1-3-3 — 한글 라벨의 모노·넓은 자간을 본문 글꼴로, 한글 화면의 영문 병기(MAX STROKE·BORE·TUBE·ROD)를 뺌,
//    '카탈로그 실측' 출처 메모를 화면에서 뺌.
//  · 5-1-3 · SMK-08 — 폰에서 도해가 오른쪽으로 잘리던(가로 밀기) 것을 폰에서만 화면 폭에 맞춰 통째로 보이게.
//    폰에선 도해 속 작은 글자(3~9px로 줄어 못 읽음)를 숨기고, 같은 수치는 바로 아래 숫자 목록(세로)이 맡는다. 데스크톱 그대로.
//  · SMK-23 — 1회 드로잉이 화면에 들어올 때 시작(DrawOnView).
import type { Lang } from "@/lib/lang";
import DrawOnView from "@/components/motion/DrawOnView";

const T = {
  ko: {
    head: "제작 범위",
    sub: "표준 내경 13단 Ø40–Ø250, 특주 대구경, 행정 한계 2,000mm(그 이상 특주).",
    note: "도해 · 축척 없음(NTS)",
    figCaption: "유압실린더 측면도 — 롯드 인출량이 행정(ST)",
    svgStroke: "행정 한계(표준)",
    svgBore: "보어(내경)",
    svgTube: "튜브",
    svgRod: "롯드",
    stats: [
      { n: "Ø800", u: "mm", k: "최대 보어(특주)", d: "표준 Ø40 – Ø250 · 13단" },
      { n: "2,000", u: "mm", k: "행정 한계", d: "그 이상 특주(좌굴강도 이하)" },
      { n: "10", u: "계열", k: "실린더 계열", d: "유압 8 · 공압 2" },
      { n: "1987", u: "", k: "제작 개시", d: "삼익 THK에서 제작·판매 시작" },
    ],
  },
  en: {
    head: "Manufacturing Range",
    sub: "13 standard bores Ø40–Ø250, custom large bore, standard stroke limit 2,000 mm (longer on request).",
    note: "Diagram · not to scale (NTS)",
    figCaption: "Hydraulic cylinder, side view — rod extension is the stroke (ST)",
    svgStroke: "STROKE LIMIT",
    svgBore: "BORE",
    svgTube: "TUBE",
    svgRod: "ROD",
    stats: [
      { n: "Ø800", u: "mm", k: "Max bore (custom)", d: "Standard Ø40 – Ø250 · 13 sizes" },
      { n: "2,000", u: "mm", k: "Stroke limit", d: "Longer on request (within buckling strength)" },
      { n: "10", u: "series", k: "Cylinder series", d: "8 hydraulic · 2 pneumatic" },
      { n: "1987", u: "", k: "Production began", d: "Started at Samick THK" },
    ],
  },
};

/* ── 측면도 좌표(CylinderSection 의 종단면 비례를 그대로 확대) ── */
const CY = 120;
const BORE_H = 104;
const WALL = 8;
const COVER_H = BORE_H + 34; // 138
const COVER_T = CY - COVER_H / 2; // 51
const COVER_B = CY + COVER_H / 2; // 189
const TIE_Y = COVER_H / 2 - 6; // 63
const BAR_T = CY - BORE_H / 2 - WALL; // 60
const BAR_B = CY + BORE_H / 2; // 172
const ROD_H = 58;
const TIP_RETRACT = 668; // 롯드 완전 후퇴 시 팁 위치(치수 기준선)
const TIP_EXTEND = 1096; // 행정 2,000 인출 시 팁
const DIM_Y = 252;

function StrokeDiagram({ label, boreLabel, tube, rod, ko }: { label: string; boreLabel: string; tube: string; rod: string; ko: boolean }) {
  const leader = { stroke: "var(--color-ink-faint)", strokeWidth: 1 } as const;
  // 라벨 글꼴 — 한글은 본문 글꼴·자간 없음, 영문은 예전 모노 그대로(1-3-3)
  const lf = ko ? { fontFamily: "var(--font-sans)" } : { fontFamily: "var(--font-mono)" };
  return (
    <svg viewBox="0 0 1200 300" className="h-auto w-full" aria-hidden>
      <defs>
        <pattern id="dwg-hatch-a" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-ink-faint)" strokeWidth="1" opacity="0.5" />
        </pattern>
        <linearGradient id="dwg-rod-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-chrome)" />
          <stop offset="0.5" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#9aa1a8" />
        </linearGradient>
      </defs>

      {/* 타이로드 + 너트 */}
      {[CY - TIE_Y, CY + TIE_Y].map((y) => (
        <g key={y}>
          <line x1={26} y1={y} x2={672} y2={y} stroke="var(--color-ink-dim)" strokeWidth={4} pathLength={1} className="dwg-draw" style={{ animationDelay: "0.15s" }} />
          <rect x={18} y={y - 6} width={16} height={12} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" className="dwg-ink" style={{ animationDelay: "0.7s" }} />
          <rect x={664} y={y - 6} width={16} height={12} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" className="dwg-ink" style={{ animationDelay: "0.7s" }} />
        </g>
      ))}

      {/* 헤드측·롯드측 카바(단면 해칭) */}
      <g className="dwg-fill" style={{ animationDelay: "0.55s" }}>
        <rect x={40} y={COVER_T} width={58} height={COVER_H} fill="url(#dwg-hatch-a)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />
        <rect x={600} y={COVER_T} width={58} height={COVER_H} fill="url(#dwg-hatch-a)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />
      </g>

      {/* 튜브 내부 + 상·하 벽 단면 */}
      <rect x={98} y={CY - BORE_H / 2} width={502} height={BORE_H} fill="var(--color-bg-panel)" className="dwg-fill" style={{ animationDelay: "0.45s" }} />
      <g className="dwg-fill" style={{ animationDelay: "0.55s" }}>
        <rect x={98} y={BAR_T} width={502} height={WALL} fill="url(#dwg-hatch-a)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
        <rect x={98} y={BAR_B} width={502} height={WALL} fill="url(#dwg-hatch-a)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      </g>

      {/* 2-PT 포트 */}
      {[120, 552].map((x) => (
        <rect key={x} x={x} y={BAR_T - 18} width={22} height={18} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} className="dwg-ink" style={{ animationDelay: "0.8s" }} />
      ))}
      {/* 쿠션밸브 */}
      {[132, 540].map((x) => (
        <rect key={x} x={x} y={BAR_B + WALL} width={14} height={12} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} className="dwg-ink" style={{ animationDelay: "0.8s" }} />
      ))}

      {/* 피스톤(씰 밴드 2줄) — 행정 최대이므로 롯드측 끝단 */}
      <g className="dwg-ink" style={{ animationDelay: "0.85s" }}>
        <rect x={540} y={CY - BORE_H / 2 + 2} width={26} height={BORE_H - 4} fill="var(--color-ink-faint)" stroke="var(--color-ink-dim)" />
        <rect x={544} y={CY - BORE_H / 2 + 2} width={4} height={BORE_H - 4} fill="var(--color-bg-raised)" />
        <rect x={558} y={CY - BORE_H / 2 + 2} width={4} height={BORE_H - 4} fill="var(--color-bg-raised)" />
      </g>

      {/* 롯드 — 카바를 관통해 인출 */}
      <rect x={566} y={CY - ROD_H / 2} width={TIP_EXTEND - 566} height={ROD_H} fill="url(#dwg-rod-a)" stroke="var(--color-ink-dim)" className="dwg-ink" style={{ animationDelay: "0.95s" }} />
      {/* 롯드 앤드 */}
      <rect x={TIP_EXTEND} y={CY - ROD_H / 2 - 9} width={22} height={ROD_H + 18} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} className="dwg-ink" style={{ animationDelay: "1.05s" }} />

      {/* ── 보어 치수선(튜브 내부 세로) — 빈 튜브 면이 수치를 떠받친다 ── */}
      <g>
        <line x1={190} y1={CY - BORE_H / 2} x2={190} y2={CY + BORE_H / 2} stroke="var(--color-red-live)" strokeWidth={1.6} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.2s" }} />
        <path d={`M 190 ${CY - BORE_H / 2} l -4.5 13 h 9 z`} fill="var(--color-red-live)" className="dwg-ink" style={{ animationDelay: "2.1s" }} />
        <path d={`M 190 ${CY + BORE_H / 2} l -4.5 -13 h 9 z`} fill="var(--color-red-live)" className="dwg-ink" style={{ animationDelay: "2.1s" }} />
        <g className="dwg-ink" style={{ animationDelay: "2.2s" }}>
          <text x={206} y={CY - 2} fontSize="19" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">
            Ø40 – Ø800
          </text>
          <text x={206} y={CY + 19} fontSize="12" letterSpacing={ko ? undefined : "0.12em"} fill="var(--color-ink-faint)" {...lf}>
            {boreLabel}
          </text>
        </g>
      </g>

      {/* ── 행정 치수선(레드 = 그래픽 전용). 좌→우 1회 드로잉 ── */}
      <g>
        <line x1={TIP_RETRACT} y1={COVER_B + 4} x2={TIP_RETRACT} y2={DIM_Y + 12} stroke="var(--color-red-live)" strokeWidth={1} strokeOpacity={0.55} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.1s" }} />
        <line x1={TIP_EXTEND + 22} y1={CY + ROD_H / 2 + 14} x2={TIP_EXTEND + 22} y2={DIM_Y + 12} stroke="var(--color-red-live)" strokeWidth={1} strokeOpacity={0.55} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.1s" }} />
        <line x1={TIP_RETRACT} y1={DIM_Y} x2={TIP_EXTEND + 22} y2={DIM_Y} stroke="var(--color-red-live)" strokeWidth={1.6} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.2s" }} />
        {/* 화살촉 */}
        <path d={`M ${TIP_RETRACT} ${DIM_Y} l 13 -4.5 v 9 z`} fill="var(--color-red-live)" className="dwg-ink" style={{ animationDelay: "2.1s" }} />
        <path d={`M ${TIP_EXTEND + 22} ${DIM_Y} l -13 -4.5 v 9 z`} fill="var(--color-red-live)" className="dwg-ink" style={{ animationDelay: "2.1s" }} />
      </g>

      {/* 치수값 — 잉크(채도색 금지) */}
      <g className="dwg-ink" style={{ animationDelay: "2.2s" }}>
        <text x={(TIP_RETRACT + TIP_EXTEND + 22) / 2} y={DIM_Y - 34} textAnchor="middle" fontSize={ko ? 13 : 12} letterSpacing={ko ? undefined : "0.14em"} fill="var(--color-ink-faint)" {...lf}>
          {label}
        </text>
        <text x={(TIP_RETRACT + TIP_EXTEND + 22) / 2} y={DIM_Y - 8} textAnchor="middle" fontSize="30" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">
          2,000
          <tspan fontSize="14" fontWeight="400" fill="var(--color-ink-dim)">
            {" "}
            mm
          </tspan>
        </text>
      </g>

      {/* 부품 지시선(원본 카탈로그 도면의 구성요소만) */}
      <g className="dwg-ink" style={{ animationDelay: "1.5s" }}>
        <line x1={340} y1={BAR_T} x2={340} y2={30} {...leader} />
        <text x={340} y={22} textAnchor="middle" fontSize="12.5" fill="var(--color-ink-faint)" {...lf}>
          {tube}
        </text>
        <line x1={860} y1={CY - ROD_H / 2} x2={860} y2={52} {...leader} />
        <text x={860} y={44} textAnchor="middle" fontSize="12.5" fill="var(--color-ink-faint)" {...lf}>
          {rod}
        </text>
      </g>
    </svg>
  );
}

export default function RangeBand({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    // 배경 전환 — 페이지 도면지(#f4f5f3) 위에 흰 시트가 한 장 얹힌다. 상·하 굵은 괘선 = 시트 모서리.
    // 풀블리드라 홈의 max-w 컨테이너 바깥(최상위)에 놓는다.
    <section className="border-y-2 border-ink bg-bg-raised">
      <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.head}</h2>
          <span className="text-[12px] text-ink-faint">{t.note}</span>
        </div>
        <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-ink-dim">{t.sub}</p>

        <figure className="mt-8 md:mt-10">
          {/* 2026-10-22(5-1-3 · SMK-08): 예전엔 폰에서 가로 밀기(오른쪽 잘림). 이제 폰에서도 도해 전체를 화면 폭에 맞추고
              (dwg-fit-phone — 폰에서만 도해 속 글자 숨김, globals.css), 수치는 아래 숫자 목록이 세로로 보여 준다. */}
          <DrawOnView className="dwg-fit-phone">
            <StrokeDiagram label={t.svgStroke} boreLabel={t.svgBore} tube={t.svgTube} rod={t.svgRod} ko={lang === "ko"} />
          </DrawOnView>
          <figcaption className="mt-1 text-[11.5px] text-ink-faint">{t.figCaption}</figcaption>
        </figure>

        {/* ── 대형 숫자 ── */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-9 md:mt-14 md:grid-cols-4 md:gap-x-10">
          {t.stats.map((s) => (
            <div key={s.k}>
              <dt className="sr-only">{s.k}</dt>
              <dd>
                <span className="tnum block font-mono text-[clamp(1.9rem,4.4vw,3.3rem)] font-bold leading-none tracking-tight text-ink">
                  {s.n}
                  {s.u && (
                    <span className="ml-1.5 align-baseline text-[clamp(0.8rem,1.2vw,1rem)] font-medium tracking-normal text-ink-faint">
                      {s.u}
                    </span>
                  )}
                </span>
                <span className="mt-3.5 block text-[13.5px] font-semibold text-ink">{s.k}</span>
                <span className="tnum mt-1 block text-[12px] leading-relaxed text-ink-faint">{s.d}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
