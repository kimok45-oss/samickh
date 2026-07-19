"use client";

// 실린더 종단면 SVG — 원본 카탈로그 도면(사실대장 §5b·transcribe/cat_p2.png)의 구성요소만 재작화:
// 튜브(단면 해칭 벽) · 피스톤 · 롯드 · 타이로드+너트 · 2-PT 포트 · 쿠션밸브.
// 스트로크 값에 따라 롯드가 실제로 인출되고, 롯드 끝 레드 핸들로 드래그 조작(포인터+키보드).
// 레드 = 조작 핸들 전용(방향서 색 문법). 보어 변경 시 실린더 굵기 반영.
import { useCallback, useRef, useState } from "react";
import type { Lang } from "@/lib/lang";

const VB_W = 960;
const VB_H = 340;
const CY = 150;
const INT_X0 = 196; // 튜브 내부 시작
const INT_X1 = 550; // 튜브 내부 끝(롯드측)
const PISTON_W = 20;
const TIP_BASE = 610; // 스트로크 0일 때 롯드 팁
const TIP_TRAVEL = 250; // 스트로크 2,000mm일 때 추가 인출(px)
export const STROKE_MAX = 2000;

export default function CylinderSection({
  boreMm,
  rodMm,
  stroke,
  onStrokeChange,
  lang,
}: {
  boreMm: number;
  rodMm: number;
  stroke: number;
  onStrokeChange: (v: number) => void;
  lang: Lang;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startStroke: number } | null>(null);
  const [focused, setFocused] = useState(false);

  const f = Math.min(Math.max((boreMm - 40) / 210, 0), 1);
  const boreH = 56 + f * 84; // 튜브 내경 높이(px)
  const wall = 7;
  const coverH = boreH + 30;
  const frac = Math.min(Math.max(stroke / STROKE_MAX, 0), 1);

  const barrelTop = CY - boreH / 2 - wall;
  const barrelBot = CY + boreH / 2;
  const rodH = Math.max(10, boreH * (rodMm / boreMm));
  const pistonX = INT_X0 + frac * (INT_X1 - INT_X0 - PISTON_W);
  const tipX = TIP_BASE + frac * TIP_TRAVEL;
  const tieY = coverH / 2 - 5;
  const dimY = CY + coverH / 2 + 44;

  const clamp = (v: number) => Math.min(STROKE_MAX, Math.max(0, Math.round(v / 10) * 10));

  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      e.preventDefault();
      (e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
      dragRef.current = { startX: e.clientX, startStroke: stroke };
    },
    [stroke],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      const d = dragRef.current;
      const svg = svgRef.current;
      if (!d || !svg) return;
      const scale = VB_W / svg.getBoundingClientRect().width; // 화면px → SVG 좌표
      const dxSvg = (e.clientX - d.startX) * scale;
      onStrokeChange(clamp(d.startStroke + (dxSvg / TIP_TRAVEL) * STROKE_MAX));
    },
    [onStrokeChange],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGGElement>) => {
      let next: number | null = null;
      const step = e.shiftKey ? 100 : 10;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") next = stroke + step;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = stroke - step;
      else if (e.key === "PageUp") next = stroke + 250;
      else if (e.key === "PageDown") next = stroke - 250;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = STROKE_MAX;
      if (next !== null) {
        e.preventDefault();
        onStrokeChange(clamp(next));
      }
    },
    [stroke, onStrokeChange],
  );

  const L = (ko: string, en: string) => (lang === "en" ? en : ko);
  const labelStyle = { fill: "var(--color-ink-faint)", fontSize: 11, fontFamily: "var(--font-mono)" } as const;
  const leader = { stroke: "var(--color-line)", strokeWidth: 1 } as const;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label={L(
        `실린더 종단면 — 내경 Ø${boreMm}, 롯드 Ø${rodMm}, 스트로크 ${stroke}mm`,
        `Cylinder cross-section — bore Ø${boreMm}, rod Ø${rodMm}, stroke ${stroke}mm`,
      )}
    >
      <defs>
        {/* 단면 해칭(절단면 표기 관례) */}
        <pattern id="cyl-hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-ink-faint)" strokeWidth="1" opacity="0.5" />
        </pattern>
        <linearGradient id="cyl-rod" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-chrome)" />
          <stop offset="0.5" stopColor="#f2f4f6" />
          <stop offset="1" stopColor="#9aa1a8" />
        </linearGradient>
      </defs>

      {/* ── 타이로드(상·하) + 너트 ── */}
      {[CY - tieY, CY + tieY].map((y) => (
        <g key={y}>
          <line x1={138} y1={y} x2={618} y2={y} stroke="var(--color-ink-dim)" strokeWidth={4} />
          <rect x={132} y={y - 5} width={14} height={10} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" />
          <rect x={610} y={y - 5} width={14} height={10} fill="var(--color-bg-panel)" stroke="var(--color-ink-dim)" />
        </g>
      ))}

      {/* ── 헤드측 카바(좌) · 롯드측 카바(우) — 단면 해칭 ── */}
      <rect x={150} y={CY - coverH / 2} width={46} height={coverH} fill="url(#cyl-hatch)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />
      <rect x={INT_X1} y={CY - coverH / 2} width={46} height={coverH} fill="url(#cyl-hatch)" stroke="var(--color-ink-dim)" strokeWidth={1.5} />

      {/* ── 튜브 벽(상·하 단면) + 내부 ── */}
      <rect x={INT_X0} y={CY - boreH / 2} width={INT_X1 - INT_X0} height={boreH} fill="var(--color-bg-panel)" />
      <rect x={INT_X0} y={barrelTop} width={INT_X1 - INT_X0} height={wall} fill="url(#cyl-hatch)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      <rect x={INT_X0} y={barrelBot} width={INT_X1 - INT_X0} height={wall} fill="url(#cyl-hatch)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />

      {/* ── 2-PT 포트(상부 양단) ── */}
      {[214, 512].map((x) => (
        <g key={x}>
          <rect x={x} y={barrelTop - 16} width={18} height={16} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
          <line x1={x + 4} y1={barrelTop - 16} x2={x + 4} y2={barrelTop - 12} stroke="var(--color-ink-dim)" strokeWidth={1} />
          <line x1={x + 14} y1={barrelTop - 16} x2={x + 14} y2={barrelTop - 12} stroke="var(--color-ink-dim)" strokeWidth={1} />
        </g>
      ))}

      {/* ── 쿠션밸브(하부 양단) ── */}
      {[224, 500].map((x) => (
        <rect key={x} x={x} y={barrelBot + wall} width={12} height={10} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
      ))}

      {/* ── 피스톤(씰 밴드 2줄) — 스트로크에 따라 이동 ── */}
      <g>
        <rect x={pistonX} y={CY - boreH / 2 + 2} width={PISTON_W} height={boreH - 4} fill="var(--color-ink-faint)" stroke="var(--color-ink-dim)" strokeWidth={1} />
        <rect x={pistonX + 3} y={CY - boreH / 2 + 2} width={3.5} height={boreH - 4} fill="var(--color-bg-raised)" />
        <rect x={pistonX + PISTON_W - 6.5} y={CY - boreH / 2 + 2} width={3.5} height={boreH - 4} fill="var(--color-bg-raised)" />
      </g>

      {/* ── 롯드 — 피스톤에서 롯드측 카바를 관통해 인출 ── */}
      <rect x={pistonX + PISTON_W} y={CY - rodH / 2} width={tipX - pistonX - PISTON_W} height={rodH} fill="url(#cyl-rod)" stroke="var(--color-ink-dim)" strokeWidth={1} />

      {/* ── 스트로크 치수선(인출부) ── */}
      <g>
        <line x1={596} y1={dimY} x2={tipX} y2={dimY} {...leader} />
        <line x1={596} y1={dimY - 5} x2={596} y2={dimY + 5} {...leader} />
        <line x1={tipX} y1={dimY - 5} x2={tipX} y2={dimY + 5} {...leader} />
        <text x={(596 + tipX) / 2} y={dimY - 8} textAnchor="middle" style={{ ...labelStyle, fill: "var(--color-ink-dim)", fontSize: 13 }} className="tnum">
          {stroke} ST
        </text>
      </g>

      {/* ── 드래그 핸들(레드 = 조작 전용) ── */}
      <g
        role="slider"
        tabIndex={0}
        aria-label={L("스트로크 조절 핸들", "Stroke drag handle")}
        aria-valuemin={0}
        aria-valuemax={STROKE_MAX}
        aria-valuenow={stroke}
        aria-valuetext={`${stroke}mm`}
        aria-orientation="horizontal"
        className="cyl-handle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {/* 터치 히트 영역(투명) */}
        <rect x={tipX - 16} y={CY - 48} width={72} height={96} fill="transparent" />
        {/* 롯드 앤드 너클 */}
        <rect x={tipX} y={CY - rodH / 2 - 7} width={14} height={rodH + 14} fill="var(--color-bg-raised)" stroke="var(--color-ink-dim)" strokeWidth={1.2} />
        {/* 그립 */}
        {focused && <circle cx={tipX + 30} cy={CY} r={17} fill="none" stroke="var(--color-red-live)" strokeWidth={1.5} opacity={0.7} />}
        <circle cx={tipX + 30} cy={CY} r={12} fill="var(--color-red-live)" />
        {[-4, 0, 4].map((d) => (
          <line key={d} x1={tipX + 30 + d} y1={CY - 4.5} x2={tipX + 30 + d} y2={CY + 4.5} stroke="var(--color-bg)" strokeWidth={1.6} />
        ))}
      </g>

      {/* ── 부품 라벨 + 지시선(원본 도면 구성요소만) ── */}
      <g>
        {/* 2-PT */}
        <line x1={223} y1={barrelTop - 16} x2={223} y2={56} {...leader} />
        <text x={223} y={48} textAnchor="middle" style={labelStyle}>
          2-PT
        </text>
        {/* 타이로드 */}
        <line x1={470} y1={CY - tieY} x2={470} y2={56} {...leader} />
        <text x={470} y={48} textAnchor="middle" style={labelStyle}>
          {L("타이로드", "TIE ROD")}
        </text>
        {/* 튜브 */}
        <line x1={340} y1={barrelBot + wall} x2={340} y2={286} {...leader} />
        <text x={340} y={300} textAnchor="middle" style={labelStyle}>
          {L("튜브", "TUBE")}
        </text>
        {/* 피스톤 — 위치 따라 이동 */}
        <line x1={pistonX + PISTON_W / 2} y1={CY - boreH / 2} x2={pistonX + PISTON_W / 2} y2={80} {...leader} />
        <text x={pistonX + PISTON_W / 2} y={72} textAnchor="middle" style={labelStyle}>
          {L("피스톤", "PISTON")}
        </text>
        {/* 롯드 */}
        <line x1={Math.min(tipX - 4, 700)} y1={CY - rodH / 2} x2={Math.min(tipX - 4, 700)} y2={96} {...leader} />
        <text x={Math.min(tipX - 4, 700)} y={88} textAnchor="middle" style={labelStyle}>
          {L("롯드", "ROD")}
        </text>
        {/* 쿠션밸브 */}
        <line x1={230} y1={barrelBot + wall + 10} x2={230} y2={286} {...leader} />
        <text x={230} y={300} textAnchor="middle" style={labelStyle}>
          {L("쿠션밸브", "CUSHION VALVE")}
        </text>
      </g>
    </svg>
  );
}
