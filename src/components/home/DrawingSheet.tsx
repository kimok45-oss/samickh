// 홈 S6 «도면과 카탈로그» — 자료실 두 입구를 도면 시트 한 장 안에 넣는다.
//
// 왜 이 형태인가: 제목이 이미 "도면과 카탈로그"인데 내용이 텍스트 상자 2개면 제목이 거짓말이 된다.
// 섹션 자체를 한 장의 도면 시트로 만든다 — ① 그래픽(종단면 + 상세 D 확대) ④ 액자(시트 테두리·표제란).
// 자료실 두 입구는 시트 하단 칸에 들어가고, 형식 토큰과 건수를 ② 대형 활자로 키운다.
//
// 도면은 CylinderSection(주문방법 스테이션)과 같은 구성요소만 재작화 — 새 부품·새 수치 없음.
// 치수값은 넣지 않는다(그 도면의 실제 치수를 회사가 공표한 바 없으므로 지어내지 않는다).
//
// 문구 소유권: 이 섹션의 UI 문구는 전부 아래 T 하나가 소유한다(리포 관례 — src/lib/i18n.ts 주석 참조).
import Link from "next/link";
import type { Lang } from "@/lib/lang";

const T = {
  ko: {
    head: "도면과 카탈로그",
    note: "실린더 종단면 · 축척 없음(NTS)",
    detail: "상세 D — 피스톤 씰 · 튜브 내벽",
    parts: { tube: "튜브", tie: "타이로드", piston: "피스톤", rod: "롯드", cushion: "쿠션밸브" },
    title: { company: "삼익유공압(주)", companyK: "제작", drawing: "도명", drawingV: "실린더 종단면", unit: "단위", unitV: "mm", scale: "축척", scaleV: "NTS" },
    rows: [
      { href: "/support/resources", token: "PDF", name: "유공압자료", desc: "표준유압·공압·MILL TYPE 카탈로그 PDF", unit: "건" },
      { href: "/support/cad", token: "DWG · DWF", name: "DWG/DWF DATA", desc: "실린더 도면 데이터 자료실", unit: "건" },
    ],
    // 2026-10-21 오너 '수정해줘'(전체점검-2026-10-19 SMK-01): 받을 수 있는 도면 파일이 0개일 때 건수 대신 쓰는 문구
    cadPending: { desc: "실린더 도면 데이터 자료실 · 파일 준비 중", request: "도면 요청", to: "→ 견적요청" },
  },
  en: {
    head: "Drawings & Catalogs",
    note: "Cylinder section · not to scale (NTS)",
    detail: "DETAIL D — piston seal · tube wall",
    parts: { tube: "TUBE", tie: "TIE ROD", piston: "PISTON", rod: "ROD", cushion: "CUSHION VALVE" },
    title: { company: "SAMICK H&P", companyK: "MADE BY", drawing: "TITLE", drawingV: "CYLINDER SECTION", unit: "UNIT", unitV: "mm", scale: "SCALE", scaleV: "NTS" },
    rows: [
      { href: "/support/resources", token: "PDF", name: "Technical Data", desc: "Hydraulic, pneumatic and MILL TYPE catalogs", unit: "files" },
      { href: "/support/cad", token: "DWG · DWF", name: "DWG/DWF DATA", desc: "Cylinder drawing data library", unit: "files" },
    ],
    cadPending: { desc: "Cylinder drawing data library · files in preparation", request: "Request drawings", to: "→ Quote" },
  },
};

/* ── 주도면(좌) 좌표 ── */
const CY = 150;
const BORE_H = 88;
const WALL = 7;
const COVER_H = BORE_H + 30; // 118
const COVER_T = CY - COVER_H / 2; // 91
const TIE_Y = COVER_H / 2 - 5; // 54
const BAR_T = CY - BORE_H / 2 - WALL; // 99
const BAR_B = CY + BORE_H / 2; // 194
const ROD_H = 46;
const PISTON_X = 306;
const PISTON_W = 22;
const TIP = 604;

/* ── 상세 D ── */
const DX = 962; // 상세원 중심
const DR = 122;
const SRC_X = PISTON_X + PISTON_W / 2; // 상세 대상 중심
const SRC_R = 62;

function Sheet({ t }: { t: (typeof T)["ko"] }) {
  const leader = { stroke: "var(--color-line)", strokeWidth: 1 } as const;
  const label = { fill: "var(--color-ink-faint)", fontSize: 12, fontFamily: "var(--font-mono)" } as const;
  return (
    <svg viewBox="0 0 1200 356" className="h-auto w-full" role="img" aria-label={t.note}>
      <defs>
        <pattern id="dwg-hatch-b" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-ink-faint)" strokeWidth="1" opacity="0.5" />
        </pattern>
        <pattern id="dwg-hatch-c" width="12" height="12" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="12" stroke="var(--color-ink-faint)" strokeWidth="1.4" opacity="0.55" />
        </pattern>
        <linearGradient id="dwg-rod-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-chrome)" />
          <stop offset="0.5" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#9aa1a8" />
        </linearGradient>
        <clipPath id="dwg-detail-clip">
          <circle cx={DX} cy={CY} r={DR} />
        </clipPath>
      </defs>

      {/* ─────────── 주도면 ─────────── */}
      {/* 타이로드 + 너트 */}
      {[CY - TIE_Y, CY + TIE_Y].map((y) => (
        <g key={y}>
          <line x1={48} y1={y} x2={528} y2={y} stroke="var(--color-ink-dim)" strokeWidth={3.5} pathLength={1} className="dwg-draw" style={{ animationDelay: "0.1s" }} />
          <rect x={42} y={y - 5} width={14} height={10} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" className="dwg-ink" style={{ animationDelay: "0.7s" }} />
          <rect x={520} y={y - 5} width={14} height={10} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" className="dwg-ink" style={{ animationDelay: "0.7s" }} />
        </g>
      ))}
      {/* 카바(단면) */}
      <g className="dwg-fill" style={{ animationDelay: "0.5s" }}>
        <rect x={60} y={COVER_T} width={46} height={COVER_H} fill="url(#dwg-hatch-b)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />
        <rect x={470} y={COVER_T} width={46} height={COVER_H} fill="url(#dwg-hatch-b)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />
      </g>
      {/* 튜브 */}
      <rect x={106} y={CY - BORE_H / 2} width={364} height={BORE_H} fill="var(--color-bg-panel)" className="dwg-fill" style={{ animationDelay: "0.4s" }} />
      <g className="dwg-fill" style={{ animationDelay: "0.5s" }}>
        <rect x={106} y={BAR_T} width={364} height={WALL} fill="url(#dwg-hatch-b)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
        <rect x={106} y={BAR_B} width={364} height={WALL} fill="url(#dwg-hatch-b)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      </g>
      {/* 2-PT 포트 · 쿠션밸브 */}
      <g className="dwg-ink" style={{ animationDelay: "0.8s" }}>
        {[124, 430].map((x) => (
          <rect key={x} x={x} y={BAR_T - 16} width={18} height={16} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
        ))}
        {[136, 420].map((x) => (
          <rect key={x} x={x} y={BAR_B + WALL} width={12} height={10} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
        ))}
      </g>
      {/* 피스톤 + 롯드 */}
      <g className="dwg-ink" style={{ animationDelay: "0.85s" }}>
        <rect x={PISTON_X} y={CY - BORE_H / 2 + 2} width={PISTON_W} height={BORE_H - 4} fill="var(--color-ink-faint)" stroke="var(--color-ink-dim)" />
        <rect x={PISTON_X + 3} y={CY - BORE_H / 2 + 2} width={3.5} height={BORE_H - 4} fill="var(--color-bg-raised)" />
        <rect x={PISTON_X + PISTON_W - 6.5} y={CY - BORE_H / 2 + 2} width={3.5} height={BORE_H - 4} fill="var(--color-bg-raised)" />
        <rect x={PISTON_X + PISTON_W} y={CY - ROD_H / 2} width={TIP - PISTON_X - PISTON_W} height={ROD_H} fill="url(#dwg-rod-b)" stroke="var(--color-ink-dim)" />
        <rect x={TIP} y={CY - ROD_H / 2 - 7} width={18} height={ROD_H + 14} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      </g>

      {/* 부품 지시선 */}
      <g className="dwg-ink" style={{ animationDelay: "1.2s" }}>
        <line x1={210} y1={BAR_T} x2={210} y2={46} {...leader} />
        <text x={210} y={38} textAnchor="middle" style={label}>{t.parts.tube}</text>
        <line x1={392} y1={CY - TIE_Y} x2={392} y2={46} {...leader} />
        <text x={392} y={38} textAnchor="middle" style={label}>{t.parts.tie}</text>
        <line x1={560} y1={CY - ROD_H / 2} x2={560} y2={72} {...leader} />
        <text x={560} y={64} textAnchor="middle" style={label}>{t.parts.rod}</text>
        <line x1={142} y1={BAR_B + WALL + 10} x2={142} y2={312} {...leader} />
        <text x={142} y={326} textAnchor="middle" style={label}>{t.parts.cushion}</text>
        <line x1={PISTON_X + PISTON_W / 2} y1={BAR_B} x2={PISTON_X + PISTON_W / 2} y2={312} {...leader} />
        <text x={PISTON_X + PISTON_W / 2} y={326} textAnchor="middle" style={label}>{t.parts.piston}</text>
      </g>

      {/* ─────────── 상세 D — 확대 ─────────── */}
      {/* 대상 원(레드 = 그래픽 전용) + 지시 접선 */}
      <g>
        <circle cx={SRC_X} cy={CY} r={SRC_R} fill="none" stroke="var(--color-red-live)" strokeWidth={1.2} strokeDasharray="5 5" pathLength={1} className="dwg-draw" style={{ animationDelay: "1.4s" }} />
        <line x1={SRC_X + SRC_R * 0.72} y1={CY - SRC_R * 0.69} x2={DX - DR * 0.72} y2={CY - DR * 0.69} stroke="var(--color-red-live)" strokeWidth={1} strokeOpacity={0.5} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.7s" }} />
        <line x1={SRC_X + SRC_R * 0.72} y1={CY + SRC_R * 0.69} x2={DX - DR * 0.72} y2={CY + DR * 0.69} stroke="var(--color-red-live)" strokeWidth={1} strokeOpacity={0.5} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.7s" }} />
        <text x={SRC_X} y={CY - SRC_R - 10} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)" className="dwg-ink" style={{ animationDelay: "1.9s" }}>
          D
        </text>
      </g>

      {/* 확대 내용(원 안으로 클립) — 튜브 내벽 · 피스톤 씰 밴드 · 롯드 */}
      <g clipPath="url(#dwg-detail-clip)" className="dwg-fill" style={{ animationDelay: "2s" }}>
        <rect x={DX - DR} y={CY - 56} width={DR * 2} height={112} fill="var(--color-bg-panel)" />
        <rect x={DX - DR} y={CY - 96} width={DR * 2} height={40} fill="url(#dwg-hatch-c)" stroke="var(--color-ink-dim)" strokeWidth={1.4} />
        <rect x={DX - DR} y={CY + 56} width={DR * 2} height={40} fill="url(#dwg-hatch-c)" stroke="var(--color-ink-dim)" strokeWidth={1.4} />
        {/* 피스톤 */}
        <rect x={DX - 96} y={CY - 56} width={104} height={112} fill="var(--color-ink-faint)" stroke="var(--color-ink-dim)" strokeWidth={1.4} />
        {/* 씰 밴드 2줄 */}
        <rect x={DX - 82} y={CY - 56} width={16} height={112} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1} />
        <rect x={DX - 24} y={CY - 56} width={16} height={112} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1} />
        {/* 롯드 */}
        <rect x={DX + 8} y={CY - 28} width={DR + 10} height={56} fill="url(#dwg-rod-b)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      </g>
      {/* 상세원 테두리 */}
      <circle cx={DX} cy={CY} r={DR} fill="none" stroke="var(--color-ink-dim)" strokeWidth={1.4} pathLength={1} className="dwg-draw" style={{ animationDelay: "1.9s" }} />
      <g className="dwg-ink" style={{ animationDelay: "2.3s" }}>
        <text x={DX} y={CY - DR - 14} textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-mono)">
          D
        </text>
        <text x={DX} y={CY + DR + 26} textAnchor="middle" style={label}>
          {t.detail}
        </text>
      </g>
    </svg>
  );
}

export default function DrawingSheet({ lang, techCount, cadCount }: { lang: Lang; techCount: number; cadCount: number }) {
  const t = T[lang];
  const counts = [techCount, cadCount];
  const tb = t.title;
  return (
    // 제 컨테이너를 스스로 갖는다(홈의 max-w 컨테이너 바깥, 최상위에 놓는다).
    <section className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
      <h2 className="text-[clamp(1.4rem,2.8vw,2rem)] font-semibold tracking-tight text-ink">{t.head}</h2>

      {/* ── 액자: 도면 시트(이중 테두리) ── */}
      <div className="mt-6 border border-ink bg-bg-raised p-1.5">
        <div className="border border-line">
          {/* 도판 — 좁은 화면에서는 시트 안에서만 가로 스크롤(페이지 본문은 안 밀린다) */}
          <div className="overflow-x-auto overscroll-x-contain px-4 pb-2 pt-6 sm:overflow-visible sm:px-8">
            <div className="min-w-[760px] sm:min-w-0">
              <Sheet t={t} />
            </div>
          </div>

          {/* 표제란 — 도면 시트의 관례. 모노 스트립 */}
          <dl className="grid grid-cols-2 border-y border-line bg-bg-panel text-[11px] sm:grid-cols-4">
            {[
              { k: tb.drawing, v: tb.drawingV, hide: false },
              { k: tb.unit, v: tb.unitV, hide: false },
              { k: tb.scale, v: tb.scaleV, hide: false },
              { k: tb.companyK, v: tb.company, hide: true },
            ].map((c, i) => (
              <div key={c.k} className={`flex items-baseline gap-2 px-4 py-2.5 ${i > 0 ? "sm:border-l sm:border-line" : ""}`}>
                <dt className={c.hide ? "sr-only" : "font-mono tracking-[0.1em] text-ink-faint"}>{c.k}</dt>
                <dd className="font-mono font-medium text-ink-dim">{c.v}</dd>
              </div>
            ))}
          </dl>

          {/* 자료실 두 입구 — 시트 하단 칸. 형식 토큰과 건수를 대형 활자로 */}
          <div>
            {t.rows.map((r, i) =>
              // 2026-10-21 오너 '수정해줘'(전체점검-2026-10-19 SMK-01): 받을 수 있는 도면이 0개면 '3건'처럼 보이지 않게
              // 건수 자리를 '도면 요청 → 견적요청' 링크로 바꾼다. 줄 전체는 그대로 자료실(/support/cad)로 가고(이름 링크를
              // after: 로 줄 전체에 펼침), 오른쪽 요청 링크만 위로 올려(z-10) 견적요청으로 보낸다 — a 안에 a 를 넣지 않기 위함.
              r.href === "/support/cad" && counts[i] === 0 ? (
                <div
                  key={r.href}
                  className={`group relative grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-2 px-5 py-6 transition-colors hover:bg-bg sm:grid-cols-[minmax(150px,210px)_1fr_auto] sm:px-8 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="order-1 font-mono text-[clamp(1.35rem,2.8vw,2.1rem)] font-bold leading-none tracking-tight text-ink-faint transition-colors group-hover:text-ink">
                    {r.token}
                  </span>
                  <span className="order-3 sm:order-2">
                    <Link
                      href={r.href}
                      className="block text-[16.5px] font-semibold text-ink after:absolute after:inset-0 hover:underline hover:underline-offset-4"
                    >
                      {r.name}
                    </Link>
                    <span className="mt-0.5 block text-[13px] text-ink-dim">{t.cadPending.desc}</span>
                  </span>
                  <Link
                    href="/support/quote"
                    className="relative z-10 order-2 shrink-0 self-baseline text-right underline-offset-4 hover:underline sm:order-3"
                  >
                    <span className="text-[15px] font-semibold text-ink">{t.cadPending.request}</span>
                    <span className="block font-mono text-[12px] text-ink-faint sm:ml-1.5 sm:inline">{t.cadPending.to}</span>
                  </Link>
                </div>
              ) : (
              <Link
                key={r.href}
                href={r.href}
                className={`group grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-2 px-5 py-6 transition-colors hover:bg-bg sm:grid-cols-[minmax(150px,210px)_1fr_auto] sm:px-8 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span className="order-1 font-mono text-[clamp(1.35rem,2.8vw,2.1rem)] font-bold leading-none tracking-tight text-ink-faint transition-colors group-hover:text-ink">
                  {r.token}
                </span>
                <span className="order-3 sm:order-2">
                  <span className="block text-[16.5px] font-semibold text-ink group-hover:underline group-hover:underline-offset-4">
                    {r.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-dim">{r.desc}</span>
                </span>
                <span className="order-2 shrink-0 self-baseline text-right sm:order-3">
                  <span className="tnum font-mono text-[clamp(1.3rem,2.4vw,1.9rem)] font-bold leading-none text-ink">
                    {counts[i]}
                  </span>
                  <span className="ml-1 font-mono text-[12px] text-ink-faint">{r.unit}</span>
                </span>
              </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
