"use client";

// S1 히어로 = 주문방법 스테이션 — 원본 카탈로그 p.11 "실린더 주문방법"의 인터랙티브 복원.
// 좌: 도구 패널(시리즈·보어 13단·롯드계열·지지부형식 10코드·스트로크·고급옵션)
// 우: 실린더 종단면 SVG(로드 인출 드래그) + 이론 출력(계산식) + 형번 스트립 + CTA.
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lang } from "@/lib/lang";
import CylinderSection, { STROKE_MAX } from "./CylinderSection";
import {
  type BoreRow,
  type Cushion,
  type MountRow,
  type Packing,
  type RodSeries,
  type SeriesKey,
  CUSHION_LABELS,
  PACKING_LABELS,
  fmtKgf,
  fmtTon,
  modelCode,
  modelSlots,
  rodDia,
  seriesPressure,
  theoreticalForce,
} from "./calc";

export default function OrderStation({
  bores,
  mounts,
  lang,
}: {
  bores: BoreRow[];
  mounts: MountRow[];
  lang: Lang;
}) {
  const [series, setSeries] = useState<SeriesKey>("140H");
  const [hl, setHl] = useState(false);
  const [packing, setPacking] = useState<Packing>("2");
  const [mounting, setMounting] = useState("FA");
  const [boreCode, setBoreCode] = useState("100");
  const [rodSeries, setRodSeries] = useState<RodSeries>("B");
  const [stroke, setStroke] = useState(500);
  const [cushion, setCushion] = useState<Cushion>("N");

  const bore = bores.find((b) => b.code === boreCode) ?? bores[0];
  const rodMm = bore ? rodDia(bore, rodSeries) : 0;
  const pressure = seriesPressure(series);
  const force = useMemo(
    () => (bore ? theoreticalForce(pressure, bore.bore, rodMm) : null),
    [bore, pressure, rodMm],
  );
  const slots = useMemo(
    () => modelSlots({ series, hl, packing, mounting, boreCode, rodSeries, stroke, cushion }),
    [series, hl, packing, mounting, boreCode, rodSeries, stroke, cushion],
  );
  const code = modelCode(slots);
  const mountRow = mounts.find((m) => m.code === mounting);

  const L = (ko: string, en: string) => (lang === "en" ? en : ko);
  if (!bore || !force) return null;

  const chip = (active: boolean) =>
    `border px-2.5 py-1.5 font-mono text-[13px] transition-colors ${
      active
        ? "border-ink bg-ink text-bg"
        : "border-line bg-transparent text-ink-dim hover:border-ink-faint hover:text-ink"
    }`;

  return (
    <div id="order-station" className="border border-line bg-bg-raised/40">
      <div className="grid gap-0 lg:grid-cols-[minmax(300px,370px)_1fr]">
        {/* ── 좌: 도구 패널 ── */}
        <aside className="border-b border-line bg-bg-panel p-5 sm:p-6 lg:border-b-0 lg:border-r">
          {/* 시리즈 + ⑩리드스위치 */}
          <fieldset>
            <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("시리즈 · SS 70H / SS 140H", "SERIES · SS 70H / SS 140H")}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(["70H", "140H"] as SeriesKey[]).map((s) => (
                <button key={s} type="button" onClick={() => setSeries(s)} className={chip(series === s)} aria-pressed={series === s}>
                  SS {s}
                  {hl ? "L" : ""}
                </button>
              ))}
            </div>
            <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-[13px] text-ink-dim">
              <input
                type="checkbox"
                checked={hl}
                onChange={(e) => setHl(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-red-live)]"
              />
              {L("⑩ 리드스위치 부착형(HL)", "⑩ Lead switch type (HL)")}
            </label>
          </fieldset>

          {/* ③ 내경(보어) 13단 */}
          <fieldset className="mt-6">
            <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("③ 실린더내경(호칭경) · 13단", "③ CYLINDER BORE · 13 SIZES")}
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label={L("내경 선택", "Select bore")}>
              {bores.map((b) => (
                <button key={b.code} type="button" onClick={() => setBoreCode(b.code)} className={chip(boreCode === b.code)} aria-pressed={boreCode === b.code}>
                  {b.code}
                </button>
              ))}
            </div>
            <p className="tnum mt-2 font-mono text-[12px] text-ink-dim">
              {L("튜브내경", "Tube bore")} Ø{bore.bore}mm
            </p>
          </fieldset>

          {/* ④ 롯드계열 B/C */}
          <fieldset className="mt-6">
            <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("④ 롯드계열 · B / C", "④ ROD SERIES · B / C")}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(["B", "C"] as RodSeries[]).map((r) => (
                <button key={r} type="button" onClick={() => setRodSeries(r)} className={chip(rodSeries === r)} aria-pressed={rodSeries === r}>
                  {r} · Ø{rodDia(bore, r)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* ② 지지부형식 10코드 */}
          <fieldset className="mt-6">
            <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("② 지지부형식 · 10코드", "② MOUNTING · 10 CODES")}
            </legend>
            <div className="mt-2 grid grid-cols-5 gap-1.5" role="group" aria-label={L("지지부형식 선택", "Select mounting")}>
              {mounts.map((m) => (
                <button key={m.code} type="button" onClick={() => setMounting(m.code)} className={chip(mounting === m.code)} aria-pressed={mounting === m.code}>
                  {m.code}
                </button>
              ))}
            </div>
            {mountRow && (
              <p className="mt-2 text-[12px] text-ink-dim">
                {mountRow.code} — {lang === "en" && mountRow.nameEn ? mountRow.nameEn : mountRow.name}
              </p>
            )}
          </fieldset>

          {/* ⑤ 스트로크 */}
          <fieldset className="mt-6">
            <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("⑤ 스트로크 · 0–2,000mm", "⑤ STROKE · 0–2,000mm")}
            </legend>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={STROKE_MAX}
                step={10}
                value={stroke}
                onChange={(e) => setStroke(Number(e.target.value))}
                aria-label={L("스트로크(mm)", "Stroke (mm)")}
                className="stroke-range w-full"
              />
              <output className="tnum shrink-0 font-mono text-[15px] font-semibold text-ink">{stroke}mm</output>
            </div>
            <p className="mt-1.5 text-[11.5px] leading-snug text-ink-faint">
              {L("행정한계 2,000mm — 2,000mm 이상은 특주(좌굴강도 이하).", "Stroke limit 2,000mm — longer strokes made to order (within buckling strength).")}
            </p>
          </fieldset>

          {/* 고급 옵션(접이식): ⑥쿠션 · ①패킹재질 */}
          <details className="acc mt-6 border-t border-line pt-4">
            <summary className="flex cursor-pointer items-center justify-between font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("고급 옵션 — ⑥쿠션 · ①패킹재질", "OPTIONS — ⑥ CUSHION · ① PACKING")}
              <span aria-hidden className="acc-plus text-[14px] leading-none text-ink-faint transition-transform">+</span>
            </summary>
            <div className="mt-3 space-y-4">
              <div role="group" aria-label={L("쿠션유무", "Cushion")}>
                <div className="text-[12px] text-ink-dim">{L("⑥ 쿠션유무", "⑥ Cushion")}</div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {(Object.keys(CUSHION_LABELS) as Cushion[]).map((c) => (
                    <button key={c} type="button" onClick={() => setCushion(c)} className={chip(cushion === c)} aria-pressed={cushion === c}>
                      {c} · {lang === "en" ? CUSHION_LABELS[c].en : CUSHION_LABELS[c].ko}
                    </button>
                  ))}
                </div>
              </div>
              <div role="group" aria-label={L("패킹재질", "Packing material")}>
                <div className="text-[12px] text-ink-dim">{L("① 패킹재질", "① Packing material")}</div>
                <div className="mt-1.5 grid gap-1.5">
                  {(Object.keys(PACKING_LABELS) as Packing[]).map((p) => (
                    <button key={p} type="button" onClick={() => setPacking(p)} className={chip(packing === p)} aria-pressed={packing === p}>
                      {p} · {lang === "en" ? PACKING_LABELS[p].en : PACKING_LABELS[p].ko}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </aside>

        {/* ── 우: 종단면 + 이론 출력 ── */}
        <div className="relative p-5 sm:p-6 lg:p-8">
          {/* 압력 표시(레드 = 압력 표시 허용) */}
          <div className="flex items-center gap-2 font-mono text-[12px] text-ink-dim">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-red-live" />
            <span className="tnum">
              {L("사용압력", "Working pressure")} P = {pressure} kgf/㎠
            </span>
          </div>

          <CylinderSection boreMm={bore.bore} rodMm={rodMm} stroke={stroke} onStrokeChange={setStroke} lang={lang} />

          {/* 이론 출력 — "이론 출력(계산식)" 라벨 필수 */}
          <div className="mt-4 border-t border-line pt-4">
            <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              {L("이론 출력(계산식)", "THEORETICAL OUTPUT (CALCULATED)")}
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div className="border border-line bg-bg-panel px-4 py-3">
                <div className="text-[12px] text-ink-dim">{L("전진(밀 때) — F = P × A", "Push — F = P × A")}</div>
                <div className="tnum mt-1 font-mono text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold text-ink">
                  {fmtKgf(force.push)} <span className="text-[0.6em] font-normal text-ink-dim">kgf</span>{" "}
                  <span className="text-[0.68em] font-normal text-ink-dim">· {fmtTon(force.push)} ton</span>
                </div>
              </div>
              <div className="border border-line bg-bg-panel px-4 py-3">
                <div className="text-[12px] text-ink-dim">{L("후진(당길 때) — F = P × (A − a)", "Pull — F = P × (A − a)")}</div>
                <div className="tnum mt-1 font-mono text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold text-ink">
                  {fmtKgf(force.pull)} <span className="text-[0.6em] font-normal text-ink-dim">kgf</span>{" "}
                  <span className="text-[0.68em] font-normal text-ink-dim">· {fmtTon(force.pull)} ton</span>
                </div>
              </div>
            </div>
            <p className="tnum mt-2 text-[11.5px] text-ink-faint">
              {L(
                `A: 피스톤 단면적 ${force.areaCm2.toFixed(1)}㎠ · a: 롯드 단면적 ${force.rodAreaCm2.toFixed(1)}㎠ · P: 사용압력(kgf/㎠, 시리즈에 따름)`,
                `A: piston area ${force.areaCm2.toFixed(1)}㎠ · a: rod area ${force.rodAreaCm2.toFixed(1)}㎠ · P: working pressure (kgf/㎠, per series)`,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── 하단: 형번 스트립(원문 주문방법 슬롯 순서) + CTA ── */}
      <div className="border-t border-line bg-bg-panel/60 px-5 py-6 sm:px-6 lg:px-8">
        <div className="font-mono text-[11px] tracking-[0.14em] text-ink-faint">
          {L("형번 — 실린더 주문방법(카탈로그 p.11)", "MODEL CODE — HOW TO ORDER (CATALOG p.11)")}
        </div>
        <p className="mt-3 flex flex-wrap items-end gap-x-1 gap-y-4" aria-label={L(`형번 ${code}`, `Model code ${code}`)}>
          {slots.map((s, i) => (
            <span key={s.labelKo} className="flex items-end">
              {i > 0 && (
                <span aria-hidden className="px-1 font-mono text-[clamp(1.1rem,2.6vw,1.9rem)] text-ink-faint">
                  -
                </span>
              )}
              <span className="flex flex-col items-center gap-1">
                <span className="tnum font-mono text-[clamp(1.1rem,2.6vw,1.9rem)] font-semibold leading-none text-ink">{s.value}</span>
                <span className="whitespace-nowrap text-[9.5px] leading-none text-ink-faint">{lang === "en" ? s.labelEn : s.labelKo}</span>
              </span>
            </span>
          ))}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/support/quote?code=${encodeURIComponent(code)}`}
            className="inline-flex h-11 items-center bg-red px-5 text-[14px] font-semibold text-white transition-colors hover:bg-red-live"
          >
            {L("이 형번으로 견적요청", "Request a quote with this code")}
          </Link>
          <Link
            href="/support/cad"
            className="inline-flex h-11 items-center border border-line px-5 text-[14px] font-medium text-ink-dim transition-colors hover:border-ink-faint hover:text-ink"
          >
            {L("CAD 자료실", "CAD Library")}
          </Link>
        </div>
      </div>
    </div>
  );
}
