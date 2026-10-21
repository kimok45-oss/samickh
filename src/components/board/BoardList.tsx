// 게시판 목록(서버 컴포넌트) — 머신 다크 토큰 + 서버 페이지네이션(10건).
// 링크는 안정 키 Post.slug(자동증가 id 링크 금지 — BUILD-CONTRACT §라우트).
import Link from "next/link";
import type { Lang } from "@/lib/lang";
import { STR } from "@/lib/i18n";
import { fmtDate } from "@/lib/date";

export type BoardListItem = {
  id: number;
  slug: string;
  title: string;
  titleEn: string | null;
  origDate: Date | null;
  hits: number;
  attachments: { id: number; missing: boolean }[];
};

/** 가운데 생략(…) 페이지 번호 목록 */
function pageList(cur: number, total: number): (number | "…")[] {
  const nums = [...new Set([1, total, cur - 1, cur, cur + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of nums) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function BoardList({
  items,
  basePath,
  page,
  totalPages,
  total,
  lang,
}: {
  items: BoardListItem[];
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  lang: Lang;
}) {
  const t = STR[lang];

  return (
    <div>
      <p className="tnum font-mono text-[12.5px] text-ink-faint">
        {lang === "ko" ? (
          <>총 <span className="text-ink-dim">{total}</span>건 · {page}/{totalPages} 페이지</>
        ) : (
          <>Total <span className="text-ink-dim">{total}</span> · Page {page} of {totalPages}</>
        )}
      </p>

      {items.length === 0 ? (
        <p className="mt-4 border border-line bg-bg-raised px-6 py-16 text-center text-[14px] text-ink-faint">
          {t.empty}
        </p>
      ) : (
        <ul className="mt-4 border-t border-line">
          {items.map((n, i) => {
            const no = total - (page - 1) * 10 - i;
            const title = lang === "en" && n.titleEn ? n.titleEn : n.title;
            const hasAtt = n.attachments.length > 0;
            // 2026-10-21 오너 '수정해줘'(전체점검-2026-10-19 SMK-01): '첨부 4 · 일부 소실'은 일부는 받을 수 있는 것처럼 읽힌다.
            // 받을 수 있는 파일 수(ready)와 준비 중인 수(pending)를 나눠, 전부 없으면 '파일 준비 중'만 보인다.
            const pending = n.attachments.filter((a) => a.missing).length;
            const ready = n.attachments.length - pending;
            return (
              <li key={n.id} className="border-b border-line-soft">
                <Link
                  href={`${basePath}/${n.slug}`}
                  className="group flex items-baseline gap-4 py-4 transition-colors hover:bg-bg-raised sm:gap-6 sm:px-3"
                >
                  <span className="tnum w-8 shrink-0 text-right font-mono text-[12.5px] text-ink-faint">
                    {no}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14.5px] font-semibold text-ink transition-colors group-hover:underline group-hover:underline-offset-4 sm:text-[15px]">
                      {title}
                    </span>
                    {hasAtt && (
                      <span className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                        [
                        {ready === 0
                          ? lang === "ko" ? "파일 준비 중" : "FILE IN PREPARATION"
                          : <>
                              {lang === "ko" ? "첨부" : "FILE"} {ready}
                              {pending > 0 && (lang === "ko" ? ` · ${pending}건 준비 중` : ` · ${pending} in preparation`)}
                            </>}
                        ]
                      </span>
                    )}
                  </span>
                  <time className="tnum hidden shrink-0 font-mono text-[12.5px] text-ink-faint sm:block">
                    {fmtDate(n.origDate, lang)}
                  </time>
                  <span className="tnum hidden w-14 shrink-0 text-right font-mono text-[12.5px] text-ink-faint sm:block">
                    {n.hits.toLocaleString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label={lang === "ko" ? "페이지" : "Pagination"}>
          {page > 1 && (
            <Link
              href={page - 1 === 1 ? basePath : `${basePath}?page=${page - 1}`}
              aria-label={t.prev}
              className="inline-flex h-9 w-9 items-center justify-center border border-line font-mono text-[13px] text-ink-dim transition-colors hover:border-ink-dim"
            >
              ‹
            </Link>
          )}
          {pageList(page, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`e${i}`} className="px-1.5 font-mono text-[13px] text-ink-faint">…</span>
            ) : (
              <Link
                key={p}
                href={p === 1 ? basePath : `${basePath}?page=${p}`}
                aria-current={p === page ? "page" : undefined}
                className={
                  "tnum inline-flex h-9 min-w-9 items-center justify-center border px-2.5 font-mono text-[13px] transition-colors " +
                  (p === page
                    ? "border-ink-dim bg-bg-raised text-ink"
                    : "border-line text-ink-dim hover:border-ink-dim")
                }
              >
                {p}
              </Link>
            ),
          )}
          {page < totalPages && (
            <Link
              href={`${basePath}?page=${page + 1}`}
              aria-label={t.next}
              className="inline-flex h-9 w-9 items-center justify-center border border-line font-mono text-[13px] text-ink-dim transition-colors hover:border-ink-dim"
            >
              ›
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
