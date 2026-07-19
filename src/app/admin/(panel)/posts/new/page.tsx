// /admin/posts/new — 새 글 작성. 첨부는 저장 후 편집 화면에서 업로드.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { isBoardKey, type BoardKey } from "@/lib/board";
import PostForm from "../PostForm";
import { ui } from "../../../ui";

export default async function AdminPostNewPage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string }>;
}) {
  await guardAdminPage();
  const sp = await searchParams;
  const board: BoardKey = sp.board && isBoardKey(sp.board) ? sp.board : "notice";

  return (
    <main className={ui.page}>
      <div className="flex items-center gap-3">
        <h1 className={ui.h1}>새 글 작성</h1>
        <Link href={`/admin/posts?board=${board}`} className={ui.btnGhost}>
          목록으로
        </Link>
      </div>
      <div className="mt-5">
        <PostForm post={null} defaultBoard={board} />
      </div>
      <p className="mt-3 text-[12.5px] text-ink-faint">
        첨부파일은 글 저장 후 편집 화면에서 업로드할 수 있습니다.
      </p>
    </main>
  );
}
