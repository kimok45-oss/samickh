// 방문자 분석 패널(서버 컴포넌트) — 관리자 대시보드 전용. 머신 다크 토큰만 사용.
// 수집: /api/track (PII-free — 일별 솔티드 visitorId·봇 제외). 집계: lib/analytics.getAnalytics.
import Link from "next/link";
import type { AnalyticsData } from "@/lib/analytics";
import VisitTrendChart from "@/components/VisitTrendChart";
import { clearAllVisits } from "@/lib/analytics-actions";

const RANGES = [
  { v: 7, label: "7일" },
  { v: 30, label: "30일" },
  { v: 90, label: "90일" },
];

const SOURCE_LABEL: Record<string, string> = {
  direct: "직접 유입",
  search: "검색",
  social: "소셜",
  referral: "외부 링크",
  internal: "내부 이동",
};
const DEVICE_LABEL: Record<string, string> = {
  desktop: "데스크톱",
  mobile: "모바일",
  tablet: "태블릿",
};

function prettyPath(p: string) {
  if (p === "/") return "홈";
  return p.length > 30 ? p.slice(0, 30) + "…" : p;
}

function Kpi({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-bg-raised p-4">
      <p className="text-[12px] font-bold text-ink-faint">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-ink">
        {value.toLocaleString("ko-KR")}
      </p>
      {sub && <p className="mt-0.5 text-[11.5px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function BarList({ title, items, labels }: {
  title: string;
  items: { key: string; count: number; pct: number }[];
  labels?: Record<string, string>;
}) {
  const max = items[0]?.count ?? 0;
  return (
    <div className="rounded-lg border border-line bg-bg-raised p-4">
      <h3 className="text-[13px] font-bold text-ink">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-ink-faint">아직 데이터가 없습니다.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((s) => (
            <li key={s.key}>
              <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                <span className="font-semibold text-ink-dim">{labels?.[s.key] ?? prettyPath(s.key)}</span>
                <span className="font-mono tabular-nums text-ink-faint">
                  {s.count.toLocaleString("ko-KR")} · {s.pct}%
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-panel">
                <div
                  className="h-full rounded-full bg-chrome"
                  style={{ width: max ? `${Math.max(3, (s.count / max) * 100)}%` : "0%" }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalyticsPanel({
  data,
  range,
  basePath = "/admin",
}: {
  data: AnalyticsData;
  range: number;
  basePath?: string;
}) {
  const { totals } = data;
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-mono text-sm font-bold tracking-wide text-ink">방문자 분석</h2>
        <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] font-bold text-ink-faint">
          자체 수집 · 익명(PII-free)
        </span>
        <div className="ml-auto inline-flex gap-1 rounded border border-line p-1">
          {RANGES.map((r) => (
            <Link
              key={r.v}
              href={`${basePath}?range=${r.v}`}
              scroll={false}
              className={
                "rounded px-3 py-1 text-[12.5px] font-bold transition-colors " +
                (r.v === range ? "bg-bg-panel text-ink" : "text-ink-faint hover:text-ink")
              }
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="오늘 방문자" value={totals.todayVisitors} sub="KST 기준" />
        <Kpi label={`방문자 (${range}일)`} value={totals.visitors} sub="일별 순방문 합" />
        <Kpi label={`페이지뷰 (${range}일)`} value={totals.pageviews} sub={`방문자당 ${totals.avgPerVisitor}p`} />
        <Kpi label="누적 페이지뷰" value={totals.allTime} sub="전체 기간" />
      </div>

      <div className="mt-3 rounded-lg border border-line bg-bg-raised p-4">
        <div className="mb-2 flex items-center gap-4 text-[12px] font-semibold text-ink-dim">
          <span className="font-bold text-ink">일별 방문 추이</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-live" aria-hidden /> 방문자
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chrome" aria-hidden /> 페이지뷰
          </span>
        </div>
        {totals.pageviews === 0 ? (
          <p className="flex h-64 items-center justify-center text-[13px] text-ink-faint">
            아직 수집된 방문 데이터가 없습니다. 공개 페이지 방문 시 자동 수집됩니다.
          </p>
        ) : (
          <VisitTrendChart data={data.daily} />
        )}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <BarList title="유입 경로" items={data.sources} labels={SOURCE_LABEL} />
        <BarList title="디바이스" items={data.devices} labels={DEVICE_LABEL} />
        <BarList title="인기 페이지" items={data.pages} />
      </div>

      {data.recent.length > 0 && (
        <div className="mt-3 rounded-lg border border-line bg-bg-raised p-4">
          <h3 className="text-[13px] font-bold text-ink">최근 방문</h3>
          <ul className="mt-2 divide-y divide-line">
            {data.recent.map((r, i) => (
              <li key={i} className="flex items-center gap-3 py-2 text-[12.5px]">
                <span className="font-semibold text-ink-dim">{prettyPath(r.path)}</span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] font-bold text-ink-faint">
                  {SOURCE_LABEL[r.source] ?? r.source}
                </span>
                <span className="text-[11px] text-ink-faint">{DEVICE_LABEL[r.device] ?? r.device}</span>
                <time className="ml-auto font-mono text-[11px] tabular-nums text-ink-faint">{r.time}</time>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 위험 작업 — details 2단 확인 뒤에만 노출 */}
      <details className="mt-3">
        <summary className="cursor-pointer text-[12px] font-semibold text-ink-faint hover:text-ink-dim">
          데이터 관리(초기화)
        </summary>
        <form action={clearAllVisits} className="mt-2 flex items-center gap-3 rounded border border-line bg-bg-panel px-4 py-3">
          <p className="text-[12.5px] text-ink-dim">
            방문 데이터 전체를 삭제합니다. 되돌릴 수 없습니다.
          </p>
          <button
            type="submit"
            className="ml-auto rounded border border-line px-3 py-1.5 text-xs font-bold text-ink-dim hover:border-red-live hover:text-ink"
          >
            전체 삭제
          </button>
        </form>
      </details>
    </section>
  );
}
