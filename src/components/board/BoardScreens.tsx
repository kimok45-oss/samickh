// 게시판 목록/상세 공용 스크린(서버 컴포넌트) — 5개 게시판 라우트 파일이 얇게 호출한다.
// 데이터는 lib/board(스키마 정본), 렌더는 BoardList/PostDetail.
import { notFound } from "next/navigation";
import { getLang } from "@/lib/lang";
import {
  BOARDS,
  getAdjacentPosts,
  getPostBySlug,
  getPostsPaged,
  type BoardKey,
} from "@/lib/board";
import BoardList from "./BoardList";
import PostDetail from "./PostDetail";

/** 게시판 목록 화면 — 페이지네이션 10건. */
export async function BoardListScreen({
  board,
  searchParams,
}: {
  board: BoardKey;
  searchParams: Promise<{ page?: string }>;
}) {
  const [lang, sp] = await Promise.all([getLang(), searchParams]);
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, total, totalPages } = await getPostsPaged({ board, page, pageSize: 10 });
  const meta = BOARDS[board];

  return (
    <div>
      {/* 2026-10-22 오너 '나머지 다 진행'(SMK-09 · 1-3-3): 한글 제목의 고정폭(모노) 글꼴을 본문 글꼴로 */}
      <h1 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? meta.ko : meta.en}
      </h1>
      <div className="mt-8">
        <BoardList
          items={items}
          basePath={meta.base}
          page={page}
          totalPages={totalPages}
          total={total}
          lang={lang}
        />
      </div>
    </div>
  );
}

/** 게시판 상세 화면 — slug 미존재 시 notFound(). */
export async function BoardDetailScreen({
  board,
  params,
}: {
  board: BoardKey;
  params: Promise<{ slug: string }>;
}) {
  const [lang, { slug }] = await Promise.all([getLang(), params]);
  const post = await getPostBySlug(board, slug);
  if (!post) notFound();

  const { prev, next } = await getAdjacentPosts(board, post.origDate, post.id);
  const meta = BOARDS[board];

  return (
    <div>
      {/* 2026-10-22 오너 '나머지 다 진행'(1-3-3 한글 모노 라벨): 한글 게시판 이름은 본문 글꼴·자간 없음 */}
      <p className={lang === "ko" ? "text-[13px] font-semibold text-ink-faint" : "font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-faint"}>
        {lang === "ko" ? meta.ko : meta.en}
      </p>
      <div className="mt-4">
        <PostDetail post={post} basePath={meta.base} lang={lang} prev={prev} next={next} />
      </div>
    </div>
  );
}
