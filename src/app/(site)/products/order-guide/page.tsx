// 실린더 주문방법 — 원본 카탈로그 p.11 전체 복원: 10슬롯 도해(①~⑩ 원문 설명) +
// ②지지부형식 10표(DB Mounting) + ③④보어/롯드 13표(DB BoreRod) + ①패킹/⑥쿠션/⑦⑧위치 원문 표.
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/motion-primitives";
import MountingIcon from "@/components/home/MountingIcon";
import OrderStation from "@/components/configurator/OrderStation";

export const metadata = pageMetadata({
  title: "실린더 주문방법",
  description: "삼익유공압 실린더 주문방법 — 형번 10슬롯(패킹재질·지지부형식·내경·롯드계열·스트로크·쿠션 외) 도해.",
  path: "/products/order-guide",
});

const SERIES_STACK = ["SS 70H", "SS 70HL", "SS 140H", "SS 140HL"];

const SLOTS = {
  ko: ["①패킹재질", "②지지부형식", "③실린더내경", "④롯드계열", "⑤스트로크", "⑥쿠션유무", "⑦포트위치", "⑧쿠션밸브위치", "⑨벨로우즈", "⑩리드스위치"],
  en: ["① Packing", "② Mounting", "③ Bore", "④ Rod series", "⑤ Stroke", "⑥ Cushion", "⑦ Port pos.", "⑧ Cushion valve pos.", "⑨ Bellows", "⑩ Lead switch"],
};

const PACKING = {
  ko: [
    ["1", "니트릴 고무"],
    ["2", "우레탄 고무 ＊표준규격품"],
    ["3", "불소 고무"],
  ],
  en: [
    ["1", "Nitrile rubber"],
    ["2", "Urethane rubber ＊standard"],
    ["3", "Fluoro rubber"],
  ],
};

const CUSHION = {
  ko: [
    ["N", "쿠션없음"],
    ["R", "롯드측 쿠션"],
    ["H", "헤드측 쿠션"],
    ["B", "양쪽 쿠션"],
  ],
  en: [
    ["N", "No cushion"],
    ["R", "Rod side cushion"],
    ["H", "Head side cushion"],
    ["B", "Both sides cushion"],
  ],
};

const T = {
  ko: {
    h1: "실린더 주문방법",
    sub: "SS70H, SS140H SERIES — KS 규격 (카탈로그 p.11 원문)",
    slotHead: "형번 10슬롯",
    packing: "① 패킹재질",
    mounting: "② 지지부형식",
    bore: "③ 실린더내경(호칭경표시) · ④ 롯드계열(B, C로 표시)",
    boreCols: ["호칭경", "튜브내경", "B계열", "C계열"],
    strokeHead: "⑤ 스트로크",
    strokeNote: "주) 스트로크 한계는 SS70H, SS140H 유압실린더 사양에서 명시된 스트로크 한계를 참고하여 주십시요.",
    cushionHead: "⑥ 쿠션유무",
    portHead: "⑦ 포트위치 · ⑧ 쿠션밸브 위치",
    portStd: "포트위치: 표준위치 A · 쿠션밸브 위치: 표준위치 B",
    portNote: "포트의 표준위치는 A방향, 쿠션밸브의 표준위치는 B방향입니다. 위치변경이 필요한 경우 A, B, C, D로 표시하여 주시기 바랍니다.",
    bellowsHead: "⑨ 벨로우즈 부착유무",
    bellowsNote: "벨로우즈 부착시 롯드길이(W치수)는 별도로 계산하여 주십시요. 무부착시: N · 부착시: W치수를 기입하십시요. 주) W치수는 카탈로그 24페이지를 참조하십시요.",
    leadHead: "⑩ 리드스위치 부착형 실린더",
    leadNote: "리이드스위치 부착형 실린더 계열(SS 70HL / SS 140HL)을 참고하십시요.",
    leadLink: "리이드스위치 부착형 실린더 보기",
    ctaStation: "홈 주문방법 스테이션에서 형번 만들기",
    ctaQuote: "견적요청",
    port: "PORT",
    cushionValve: "CUSHION VALVE",
  },
  en: {
    h1: "How to Order",
    sub: "SS70H, SS140H SERIES — KS standard (original catalog p.11)",
    slotHead: "10-Slot Model Code",
    packing: "① Packing Material",
    mounting: "② Mounting Type",
    bore: "③ Cylinder Bore (nominal) · ④ Rod Series (B, C)",
    boreCols: ["Nominal", "Tube bore", "B series", "C series"],
    strokeHead: "⑤ Stroke",
    strokeNote: "Note: refer to the stroke limits stated in the SS70H / SS140H hydraulic cylinder specification.",
    cushionHead: "⑥ Cushion",
    portHead: "⑦ Port Position · ⑧ Cushion Valve Position",
    portStd: "Port: standard position A · Cushion valve: standard position B",
    portNote: "The standard port position is A and the standard cushion valve position is B. If a change is required, mark it as A, B, C or D.",
    bellowsHead: "⑨ Bellows",
    bellowsNote: "With bellows, the rod length (W dimension) must be calculated separately. Without: N · With: enter the W dimension. Note: see catalog page 24 for W dimensions.",
    leadHead: "⑩ Lead Switch Type Cylinder",
    leadNote: "Refer to the lead switch mounting cylinder series (SS 70HL / SS 140HL).",
    leadLink: "View lead switch type series",
    ctaStation: "Build a model code in the order station",
    ctaQuote: "Request a Quote",
    port: "PORT",
    cushionValve: "CUSHION VALVE",
  },
};

/** ⑦⑧ 위치 도해 — 원문 figure(정면도: A 상단 PORT, B 우측 CUSHION VALVE, C 하단, D 좌측) 재작화. */
function PortPositionFigure({ port, cushionValve }: { port: string; cushionValve: string }) {
  const label = { fill: "var(--color-ink-dim)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 } as const;
  const small = { fill: "var(--color-ink-faint)", fontFamily: "var(--font-mono)", fontSize: 10 } as const;
  return (
    <svg viewBox="0 0 300 240" className="h-auto w-full max-w-[340px]" role="img" aria-label="A/B/C/D position diagram">
      {/* 정사각 플랜지 정면 */}
      <rect x="90" y="60" width="120" height="120" fill="none" stroke="var(--color-ink-dim)" strokeWidth="1.4" />
      {[
        [104, 74],
        [196, 74],
        [104, 166],
        [196, 166],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="7" fill="none" stroke="var(--color-ink-faint)" strokeWidth="1.2" />
      ))}
      <circle cx="150" cy="120" r="30" fill="none" stroke="var(--color-ink-dim)" strokeWidth="1.4" />
      <circle cx="150" cy="120" r="21" fill="none" stroke="var(--color-ink-faint)" strokeWidth="1" />
      {/* A 상단(PORT) */}
      <line x1="150" y1="58" x2="150" y2="34" stroke="var(--color-line)" strokeWidth="1" />
      <text x="150" y="26" textAnchor="middle" style={label}>A</text>
      <text x="163" y="26" style={small}>{port}</text>
      {/* B 우측(CUSHION VALVE) */}
      <line x1="212" y1="120" x2="234" y2="120" stroke="var(--color-line)" strokeWidth="1" />
      <text x="242" y="124" style={label}>B</text>
      <text x="200" y="210" style={small}>{cushionValve}</text>
      <line x1="222" y1="130" x2="212" y2="198" stroke="var(--color-line)" strokeWidth="0.8" />
      {/* C 하단 */}
      <line x1="150" y1="182" x2="150" y2="200" stroke="var(--color-line)" strokeWidth="1" />
      <text x="150" y="216" textAnchor="middle" style={label}>C</text>
      {/* D 좌측 */}
      <line x1="88" y1="120" x2="66" y2="120" stroke="var(--color-line)" strokeWidth="1" />
      <text x="52" y="124" style={label}>D</text>
    </svg>
  );
}

export default async function OrderGuidePage() {
  const lang = await getLang();
  const t = T[lang];
  const [bores, mounts] = await Promise.all([
    prisma.boreRod.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mounting.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const th = "border-b border-line px-3 py-2 text-left text-[12px] font-medium text-ink-faint";
  const td = "border-b border-line-soft px-3 py-2 text-[13.5px] text-ink-dim";

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">{t.h1}</h1>
      <p className="mt-3 font-mono text-[12.5px] text-ink-faint">{t.sub}</p>

      {/* ── 온라인 형번 조합기(카탈로그 주문방법의 인터랙티브판 — 홈에서 이동, 오너 피드백) ── */}
      <Reveal as="section" className="mt-10">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">
          {lang === "ko" ? "온라인 형번 조합기" : "ONLINE CODE BUILDER"}
        </h2>
        <div className="mt-4">
          <OrderStation
            bores={bores.map((b) => ({ code: b.code, bore: b.bore, rodB: b.rodB, rodC: b.rodC }))}
            mounts={mounts.map((m) => ({ code: m.code, name: m.name, nameEn: m.nameEn }))}
            lang={lang}
          />
        </div>
      </Reveal>

      {/* ── 10슬롯 도해(원문 상단 다이어그램) ── */}
      <Reveal as="section" className="mt-10">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.slotHead}</h2>
        <div className="mt-4 overflow-x-auto border border-line bg-bg-raised/40 p-5">
          <div className="flex min-w-max items-center gap-3">
            {/* 시리즈 스택(원문 좌측 4박스 — ⑩리드스위치는 HL 표기로 시리즈에 포함) */}
            <div className="grid gap-1">
              {SERIES_STACK.map((s) => (
                <span key={s} className="tnum border border-line bg-bg-panel px-3 py-1 text-center font-mono text-[12.5px] text-ink">
                  {s}
                </span>
              ))}
            </div>
            <span aria-hidden className="font-mono text-[18px] text-ink-faint">-</span>
            {SLOTS[lang].slice(0, 9).map((s, i) => (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="font-mono text-[18px] text-ink-faint">-</span>}
                <span className="flex flex-col items-center gap-1.5">
                  <span className="h-10 w-14 border border-dashed border-line bg-bg-panel" />
                  <span className="whitespace-nowrap text-[10px] text-ink-faint">{s}</span>
                </span>
              </span>
            ))}
            <span className="flex flex-col items-center gap-1.5 pl-2">
              <span className="flex h-10 items-center font-mono text-[12px] text-ink-faint">HL</span>
              <span className="whitespace-nowrap text-[10px] text-ink-faint">{SLOTS[lang][9]}</span>
            </span>
          </div>
        </div>
      </Reveal>

      {/* ── ① 패킹재질 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.packing}</h2>
        <table className="mt-4 w-full max-w-[520px] border-t border-line">
          <tbody>
            {PACKING[lang].map(([code, name]) => (
              <tr key={code}>
                <td className={`${td} tnum w-16 font-mono font-semibold text-ink`}>{code}</td>
                <td className={td}>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* ── ② 지지부형식 10코드(DB Mounting) ── */}
      <Reveal as="section" className="mt-14" id="mounting">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.mounting}</h2>
        <ul className="mt-4 grid grid-cols-1 border-b border-l border-line sm:grid-cols-2">
          {mounts.map((m) => (
            <li key={m.code} className="flex items-center gap-4 border-r border-t border-line px-4 py-3.5">
              <span className="text-ink-faint">
                <MountingIcon code={m.code} />
              </span>
              <span className="tnum w-10 font-mono text-[16px] font-semibold text-ink">{m.code}</span>
              <span className="min-w-0">
                <span className="block text-[13.5px] text-ink-dim">{lang === "en" && m.nameEn ? m.nameEn : m.name}</span>
                {lang !== "en" && m.nameEn && <span className="block font-mono text-[10.5px] text-ink-faint">{m.nameEn}</span>}
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ── ③④ 보어/롯드 13단(DB BoreRod) ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.bore}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="tnum w-full max-w-[620px] font-mono text-[13px]">
            <thead>
              <tr>
                {t.boreCols.map((c) => (
                  <th key={c} className={th}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bores.map((b) => (
                <tr key={b.code}>
                  <td className={`${td} font-semibold text-ink`}>{b.code}</td>
                  <td className={td}>Ø{b.bore}</td>
                  <td className={td}>Ø{b.rodB}</td>
                  <td className={td}>Ø{b.rodC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* ── ⑤ 스트로크 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.strokeHead}</h2>
        <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-dim">{t.strokeNote}</p>
      </Reveal>

      {/* ── ⑥ 쿠션유무 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.cushionHead}</h2>
        <table className="mt-4 w-full max-w-[520px] border-t border-line">
          <tbody>
            {CUSHION[lang].map(([code, name]) => (
              <tr key={code}>
                <td className={`${td} tnum w-16 font-mono font-semibold text-ink`}>{code}</td>
                <td className={td}>{name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* ── ⑦⑧ 포트·쿠션밸브 위치 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.portHead}</h2>
        <p className="mt-3 text-[13.5px] text-ink-dim">{t.portStd}</p>
        <div className="mt-5 grid items-start gap-6 sm:grid-cols-[340px_1fr]">
          <div className="border border-line bg-bg-raised/40 p-4">
            <PortPositionFigure port={t.port} cushionValve={t.cushionValve} />
          </div>
          <p className="max-w-[52ch] text-[13.5px] leading-relaxed text-ink-dim">{t.portNote}</p>
        </div>
      </Reveal>

      {/* ── ⑨ 벨로우즈 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.bellowsHead}</h2>
        <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-dim">{t.bellowsNote}</p>
      </Reveal>

      {/* ── ⑩ 리드스위치 ── */}
      <Reveal as="section" className="mt-14">
        <h2 className="font-mono text-[13px] tracking-[0.14em] text-ink-faint">{t.leadHead}</h2>
        <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-dim">{t.leadNote}</p>
        <Link
          href="/business/ss-leadswitch"
          className="mt-4 inline-flex h-10 items-center border border-line px-4 text-[13px] text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
        >
          {t.leadLink} →
        </Link>
      </Reveal>

      {/* ── CTA ── */}
      <div className="mt-16 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link
          href="/#order-station"
          className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
        >
          {t.ctaStation}
        </Link>
        <Link
          href="/support/quote"
          className="inline-flex h-11 items-center bg-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-live"
        >
          {t.ctaQuote}
        </Link>
      </div>
    </div>
  );
}
