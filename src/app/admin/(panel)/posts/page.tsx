// /admin/posts ① — 게시판 관리(필터: notice·news·tech·cad·pinfo).
// free/qna는 이식 대상 아님(원문 전건 외부 홍보+PII) — 선택지에 넣지 않는다(계약 §콘텐츠).
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { BOARDS, BOARD_KEYS, getPostsPaged, isBoardKey, type BoardKey } from "@/lib/board";
import { togglePostPublished, deletePost } from "@/lib/admin-actions";
import { fmtDate } from "@/lib/date";
import { ui } from "../../ui";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string; page?: string; err?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const board: BoardKey = sp.board && isBoardKey(sp.board) ? sp.board : "notice";
  const page = Number(sp.page) || 1;
  const { items, total, totalPages } = await getPostsPaged({
    board,
    page,
    pageSize: 20,
    publishedOnly: false,
  });

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>게시판 관리</h1>
        <Link href={`/admin/posts/new?board=${board}`} className={ui.btn}>
          새 글 작성
        </Link>
      </div>

      {sp.err && (
        <p className={`mt-4 ${ui.err}`}>
          저장에 실패했습니다({sp.err === "invalid" ? "제목 필수" : "슬러그 중복 등 저장 오류"}).
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {BOARD_KEYS.map((k) => (
          <Link key={k} href={`/admin/posts?board=${k}`} className={ui.tab(k === board)}>
            {BOARDS[k].ko}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[12.5px] font-semibold text-ink-faint">
        총 {total}건 · {page}/{totalPages} 페이지
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-line bg-bg-raised">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={ui.th}>슬러그</th>
              <th className={ui.th}>제목</th>
              <th className={ui.th}>작성일</th>
              <th className={ui.th}>조회</th>
              <th className={ui.th}>첨부</th>
              <th className={ui.th}>공개</th>
              <th className={ui.th}>관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p) => (
              <tr key={p.id}>
                <td className={`${ui.td} font-mono text-[12px] text-ink-faint`}>{p.slug}</td>
                <td className={ui.td}>
                  <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className={`${ui.td} font-mono tabular-nums text-ink-dim`}>{fmtDate(p.origDate)}</td>
                <td className={`${ui.td} font-mono tabular-nums text-ink-dim`}>{p.hits}</td>
                <td className={`${ui.td} text-ink-dim`}>
                  {p.attachments.length > 0 && (
                    <span className={ui.chip}>
                      {p.attachments.length}
                      {p.attachments.some((a) => a.missing) && " · 소실"}
                    </span>
                  )}
                </td>
                <td className={ui.td}>
                  <form action={togglePostPublished}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className={ui.btnSmall}>
                      {p.published ? "공개" : "비공개"}
                    </button>
                  </form>
                </td>
                <td className={ui.td}>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/posts/${p.id}`} className={ui.btnSmall}>
                      수정
                    </Link>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className={ui.btnSmallDanger}>
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-faint">
                  게시물이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="페이지" className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/posts?board=${board}&page=${p}`}
              aria-current={p === page ? "page" : undefined}
              className={ui.tab(p === page)}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
