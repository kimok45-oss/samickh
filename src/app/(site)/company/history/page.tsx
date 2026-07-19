// 회사연혁 — DB History 14건 전량, 연도 원장(같은 연도는 연도를 한 번만 표기).
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/lang";
import { pageMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/motion-primitives";

export const metadata = pageMetadata({
  title: "회사연혁",
  description: "삼익유공압주식회사 연혁 — 1987년 유공압 실린더 제작 판매 개시부터의 기록.",
  path: "/company/history",
});

export default async function HistoryPage() {
  const lang = await getLang();
  const rows = await prisma.history.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "회사연혁" : "History"}
      </h1>
      <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
        {rows.length > 0 && `${Math.min(...rows.map((r) => r.year))} — ${Math.max(...rows.map((r) => r.year))}`}
      </p>

      <Reveal className="mt-10">
        <ul className="border-t border-line">
          {rows.map((h, i) => {
            const showYear = i === 0 || rows[i - 1].year !== h.year;
            return (
              <li
                key={h.id}
                className={`grid grid-cols-[86px_1fr] items-baseline gap-4 py-4 sm:grid-cols-[140px_1fr] sm:gap-8 ${
                  showYear ? "border-t border-line first:border-t-0" : ""
                } border-b border-line-soft last:border-b-0`}
              >
                <span className="tnum font-mono text-[20px] font-semibold leading-none text-ink sm:text-[26px]">
                  {showYear ? h.year : ""}
                </span>
                <span className="text-[14.5px] leading-relaxed text-ink-dim">
                  {lang === "en" && h.textEn ? h.textEn : h.text}
                </span>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </div>
  );
}
