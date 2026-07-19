"use client";

// 일별 방문 추이 차트(recharts) — 관리자 대시보드 전용.
// 색은 머신 다크 토큰 근사값을 CSS 변수로 받는다(--color-* 는 globals @theme 정의).
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState } from "react";

export type TrendPoint = { date: string; label: string; visitors: number; views: number };

export default function VisitTrendChart({ data }: { data: TrendPoint[] }) {
  // SSR 하이드레이션 흔들림 방지 — 마운트 후 렌더
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const accent = "var(--color-red-live, #d2452a)"; // 그래픽 전용 레드(본문 텍스트 아님)
  const accent2 = "var(--color-chrome, #cdd2d7)";
  const grid = "var(--color-line, #2e3339)";
  const axis = "var(--color-ink-faint, #7c8288)";

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse rounded bg-bg-panel/60" aria-hidden />;
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="일별 방문 추이 차트">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="samickhVisit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
              <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: axis }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fontSize: 11, fill: axis }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${grid}`,
              background: "var(--color-bg-panel, #21252a)",
              color: "var(--color-ink, #e8eaec)",
              fontSize: 13,
              fontWeight: 600,
            }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="방문자"
            stroke={accent}
            strokeWidth={2.5}
            fill="url(#samickhVisit)"
            animationDuration={700}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="views"
            name="페이지뷰"
            stroke={accent2}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            animationDuration={700}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
