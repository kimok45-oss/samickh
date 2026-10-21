// 게시물 상세(서버 컴포넌트) — 헤더(제목·원문 작성일·조회수) + LegacyPlate 정화 본문 +
// 첨부(missing 뱃지·size=0 표시 생략) + 이전/다음 + 목록 + 조회수 비콘.
// 원본 스펙표 HTML은 B의 LegacyPlate(도면지 플레이트 + 가로 스크롤 래퍼)로 렌더 — 구식
// bgcolor 무력화·다크 대비는 globals 하단 .legacy-plate CSS가 담당한다.
import Link from "next/link";
import type { Lang } from "@/lib/lang";
import { STR } from "@/lib/i18n";
import { fmtDate } from "@/lib/date";
import { LegacyPlate } from "@/components/LegacyHtml";
import HitBeacon from "./HitBeacon";

export type PostDetailData = {
  id: number;
  board: string;
  slug: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  origDate: Date | null;
  hits: number;
  attachments: {
    id: number;
    fileName: string;
    storeName: string;
    size: number;
    missing: boolean;
  }[];
};

type Adjacent = { slug: string; title: string; titleEn: string | null } | null;

export default function PostDetail({
  post,
  basePath,
  lang,
  prev = null,
  next = null,
}: {
  post: PostDetailData;
  basePath: string;
  lang: Lang;
  prev?: Adjacent;
  next?: Adjacent;
}) {
  const t = STR[lang];
  const title = lang === "en" && post.titleEn ? post.titleEn : post.title;
  const body = lang === "en" && post.bodyEn ? post.bodyEn : post.body;

  return (
    <article>
      {/* 조회수 증가(쿠키 디듀프 1일) — 클라 비콘 → /api/hit */}
      <HitBeacon board={post.board} slug={post.slug} />

      <header className="border-b border-line pb-6">
        <h1 className="text-[clamp(1.25rem,2.6vw,1.75rem)] font-bold leading-snug text-ink">
          {title}
        </h1>
        <p className="tnum mt-3 font-mono text-[12.5px] text-ink-faint">
          <time>{fmtDate(post.origDate, lang)}</time>
          <span className="mx-2" aria-hidden>·</span>
          {t.views} {post.hits.toLocaleString()}
        </p>
      </header>

      <div className="py-8">
        {body.trim() ? (
          <LegacyPlate html={body} />
        ) : (
          <p className="text-[14px] text-ink-faint">{t.noBody}</p>
        )}
      </div>

      {post.attachments.length > 0 && (
        <section className="border-t border-line py-5" aria-label={t.attachments}>
          <h2 className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-faint">
            {t.attachments}
          </h2>
          <ul className="mt-3 space-y-2">
            {post.attachments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2 text-[13.5px]">
                {a.missing || !a.storeName ? (
                  <>
                    <span className="text-ink-dim">{a.fileName}</span>
                    <span className="inline-flex items-center rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-ink-faint">
                      {t.missingFile}
                    </span>
                  </>
                ) : (
                  <a
                    href={encodeURI(a.storeName)}
                    download={a.fileName}
                    className="inline-flex items-center gap-2 font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    <span aria-hidden className="font-mono text-[11px] text-ink-faint">↓</span>
                    {a.fileName}
                    {a.size > 0 && (
                      <span className="tnum font-mono text-[11.5px] font-normal text-ink-faint">
                        {(a.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                    )}
                  </a>
                )}
              </li>
            ))}
          </ul>
          {/* 2026-10-21 오너 '수정해줘'(전체점검-2026-10-19 SMK-01): 도면 파일이 아직 없을 때 막다른 길이 되지 않게
              견적요청으로 가는 길 한 줄(DWG/DWF DATA 게시판만). */}
          {post.board === "cad" && post.attachments.some((a) => a.missing || !a.storeName) && (
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13.5px] text-ink-dim">
              <span>{t.cadRequest}</span>
              <Link
                href="/support/quote"
                className="font-semibold text-ink underline underline-offset-4 hover:decoration-2"
              >
                {t.cadRequestCta}
              </Link>
            </p>
          )}
        </section>
      )}

      {/* 이전/다음 글 */}
      <nav className="border-t border-line" aria-label={lang === "ko" ? "이전/다음 글" : "Adjacent posts"}>
        {next && (
          <Link
            href={`${basePath}/${next.slug}`}
            className="flex items-baseline gap-4 border-b border-line-soft py-3.5 text-[13.5px] transition-colors hover:bg-bg-raised sm:px-3"
          >
            <span className="w-14 shrink-0 font-mono text-[11.5px] text-ink-faint">{t.next}</span>
            <span className="line-clamp-1 text-ink-dim">
              {lang === "en" && next.titleEn ? next.titleEn : next.title}
            </span>
          </Link>
        )}
        {prev && (
          <Link
            href={`${basePath}/${prev.slug}`}
            className="flex items-baseline gap-4 border-b border-line-soft py-3.5 text-[13.5px] transition-colors hover:bg-bg-raised sm:px-3"
          >
            <span className="w-14 shrink-0 font-mono text-[11.5px] text-ink-faint">{t.prev}</span>
            <span className="line-clamp-1 text-ink-dim">
              {lang === "en" && prev.titleEn ? prev.titleEn : prev.title}
            </span>
          </Link>
        )}
      </nav>

      <div className="mt-8">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-[13px] font-semibold text-ink-dim transition-colors hover:border-ink-dim hover:text-ink"
        >
          {t.backToList}
        </Link>
      </div>
    </article>
  );
}
