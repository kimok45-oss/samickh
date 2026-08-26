// /admin/posts/[id] — 글 편집 + 첨부 관리(업로드/삭제/missing 실파일 복원).
// 첨부 업로드는 bodySizeLimit(1MB) 때문에 /api/admin/attachments 라우트 폼 타깃으로 처리.
import Link from "next/link";
import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteAttachment } from "@/lib/admin-actions";
import { isBoardKey, type BoardKey } from "@/lib/board";
import PostForm from "../PostForm";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { ui } from "../../../ui";

const ERR_LABEL: Record<string, string> = {
  nofile: "파일을 선택해 주세요.",
  ext: "허용되지 않는 확장자입니다(pdf·zip·jpg·jpeg·png·gif·dwg·dwf).",
  magic: "파일 내용이 확장자와 일치하지 않습니다(매직바이트 불일치).",
  toobig: "20MB 이하 파일만 업로드할 수 있습니다.",
};

export default async function AdminPostEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; saved?: string; attsaved?: string }>;
}) {
  await guardAdminPage();

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();

  const post = await prisma.post.findUnique({
    where: { id },
    include: { attachments: { orderBy: { id: "asc" } } },
  });
  if (!post) notFound();

  const sp = await searchParams;
  const board: BoardKey = isBoardKey(post.board) ? post.board : "notice";

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>글 편집 <span className="text-ink-faint">#{post.id}</span></h1>
        <span className={ui.chip}>조회 {post.hits}</span>
        <Link href={`/admin/posts?board=${board}`} className={ui.btnGhost}>
          목록으로
        </Link>
      </div>

      {(sp.saved || sp.attsaved) && (
        <p className={`mt-4 ${ui.err}`}>저장되었습니다.</p>
      )}
      {sp.err && <p className={`mt-4 ${ui.err}`}>{ERR_LABEL[sp.err] ?? "저장에 실패했습니다."}</p>}

      <div className="mt-5">
        <PostForm post={post} defaultBoard={board} />
      </div>

      {/* ── 첨부 관리 ── */}
      <section className={`mt-5 ${ui.panel}`}>
        <h2 className={ui.h2}>첨부파일</h2>

        {post.attachments.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-faint">첨부가 없습니다.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {post.attachments.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 text-[13.5px]">
                <span className="font-semibold">{a.fileName}</span>
                {a.size > 0 && (
                  <span className="font-mono text-[11.5px] tabular-nums text-ink-faint">
                    {(a.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                )}
                {a.missing ? (
                  <>
                    <span className={ui.chip}>원본 서버 소실 — 실파일 업로드 시 복원</span>
                    {/* missing 실파일 복원 — 업로드 시 missing 해제 */}
                    <form
                      action="/api/admin/attachments"
                      method="post"
                      encType="multipart/form-data"
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="replaceId" value={a.id} />
                      <input type="file" name="file" required className="max-w-56 text-[12px] text-ink-dim" />
                      <button type="submit" className={ui.btnSmall}>실파일 업로드</button>
                    </form>
                  </>
                ) : (
                  a.storeName && (
                    <a
                      href={encodeURI(a.storeName)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12.5px] font-semibold text-ink-dim underline-offset-2 hover:underline"
                    >
                      보기
                    </a>
                  )
                )}
                <form action={deleteAttachment} className="ml-auto">
                  <input type="hidden" name="id" value={a.id} />
                  <ConfirmSubmit className={ui.btnSmallDanger} confirmClassName={ui.btnSmallDangerArmed} cancelClassName={ui.btnSmall}>
                    삭제
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}

        {/* 신규 첨부 업로드 */}
        <form
          action="/api/admin/attachments"
          method="post"
          encType="multipart/form-data"
          className="mt-4 flex flex-wrap items-center gap-3 rounded border border-line bg-bg-panel px-4 py-3"
        >
          <input type="hidden" name="postId" value={post.id} />
          <input type="file" name="files" multiple required className="text-[12.5px] text-ink-dim" />
          <button type="submit" className={ui.btnSmall}>업로드</button>
          <span className="text-[11.5px] text-ink-faint">
            pdf·zip·jpg·jpeg·png·gif·dwg·dwf · 최대 20MB · 매직바이트 검증 · 난수 파일명 저장
          </span>
        </form>
      </section>
    </main>
  );
}
