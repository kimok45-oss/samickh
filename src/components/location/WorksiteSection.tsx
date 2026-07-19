"use client";

import { useState } from "react";
import { WorksiteMap } from "./WorksiteMap";
import type { Worksite, Provider } from "@/lib/directions";

// 다중 사업장 섹션(본사 + 공장N). 1곳이면 탭 없이 바로 표시, 여러 곳이면 탭.
// 탭 상태 때문에 클라 컴포넌트. WorksiteMap 자체는 서버라 데이터만 내려보낸다.
export function WorksiteSection({
  sites,
  locale = "ko",
  mode = "image",
  providers,
  title,
  eyebrow = "WORKSITES",
}: {
  sites: Worksite[];
  locale?: string;
  mode?: "image" | "svg";
  providers?: Provider[];
  title?: string;
  eyebrow?: string;
}) {
  const lang = locale.startsWith("ko") ? "ko" : "en";
  const [active, setActive] = useState(0);
  const multi = sites.length > 1;
  const site = sites[active] ?? sites[0];
  const heading = title ?? (lang === "ko" ? "사업장 안내" : "Our locations");
  if (!site) return null;

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-16 sm:py-20">
      <div className="text-[12px] font-medium tracking-[0.18em]" style={{ color: "var(--color-accent-ink,#2358a8)" }}>
        {eyebrow}
      </div>
      <h2 className="mt-2 text-[1.8rem] font-semibold tracking-tight sm:text-[2.2rem]" style={{ color: "var(--color-ink,#14171a)" }}>
        {heading}
      </h2>

      {multi && (
        <div role="tablist" aria-label={heading} className="mt-7 flex flex-wrap gap-2">
          {sites.map((s, i) => (
            <button
              key={s.key}
              role="tab"
              id={`ws-tab-${s.key}`}
              aria-selected={i === active}
              aria-controls={`ws-panel-${s.key}`}
              onClick={() => setActive(i)}
              className="rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors"
              style={
                i === active
                  ? { background: "var(--color-accent,#2358a8)", color: "#fff", borderColor: "transparent" }
                  : { borderColor: "var(--color-line,#e3e7ec)", color: "var(--color-ink-2,#3f4d5a)" }
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div id={`ws-panel-${site.key}`} role={multi ? "tabpanel" : undefined} aria-labelledby={multi ? `ws-tab-${site.key}` : undefined} className="mt-8">
        <WorksiteMap site={site} locale={locale} mode={mode} providers={providers} />
      </div>
    </section>
  );
}
