// 게시글 편집 폼(서버 컴포넌트 — 비제어 입력 + 서버액션 savePost).
import { savePost } from "@/lib/admin-actions";
import { BOARDS, BOARD_KEYS, type BoardKey } from "@/lib/board";
import { toKstInputValue } from "@/lib/date";
import { ui } from "../../ui";

type PostLike = {
  id: number;
  board: string;
  slug: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  origDate: Date | null;
  published: boolean;
} | null;

export default function PostForm({ post, defaultBoard }: { post: PostLike; defaultBoard: BoardKey }) {
  return (
    <form action={savePost} className={`${ui.panel} space-y-4`}>
      {post && <input type="hidden" name="id" value={post.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={ui.label} htmlFor="board">게시판</label>
          <select id="board" name="board" defaultValue={post?.board ?? defaultBoard} className={`${ui.select} w-full`}>
            {BOARD_KEYS.map((k) => (
              <option key={k} value={k}>{BOARDS[k].ko}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={ui.label} htmlFor="slug">슬러그(URL 키 — 영문/숫자/하이픈, 비우면 자동)</label>
          <input id="slug" name="slug" defaultValue={post?.slug ?? ""} className={ui.input} placeholder="notice-2" />
        </div>
        <div>
          <label className={ui.label} htmlFor="origDate">작성일</label>
          <input
            id="origDate"
            name="origDate"
            type="datetime-local"
            defaultValue={post?.origDate ? toKstInputValue(post.origDate) : toKstInputValue(new Date())}
            className={ui.input}
          />
        </div>
      </div>

      <div>
        <label className={ui.label} htmlFor="title">제목 *</label>
        <input id="title" name="title" required defaultValue={post?.title ?? ""} className={ui.input} />
      </div>
      <div>
        <label className={ui.label} htmlFor="titleEn">제목(EN — 비우면 국문 폴백)</label>
        <input id="titleEn" name="titleEn" defaultValue={post?.titleEn ?? ""} className={ui.input} />
      </div>

      <div>
        <label className={ui.label} htmlFor="body">본문(HTML — 저장 시 원문 보존, 공개 렌더에서 정화)</label>
        <textarea id="body" name="body" rows={14} defaultValue={post?.body ?? ""} className={ui.textarea} />
      </div>
      <div>
        <label className={ui.label} htmlFor="bodyEn">본문(EN — 비우면 국문 폴백)</label>
        <textarea id="bodyEn" name="bodyEn" rows={6} defaultValue={post?.bodyEn ?? ""} className={ui.textarea} />
      </div>

      <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-dim">
        <input type="checkbox" name="published" defaultChecked={post?.published ?? true} className="h-4 w-4" />
        공개
      </label>

      <div className="flex gap-2">
        <button type="submit" className={ui.btn}>저장</button>
      </div>
    </form>
  );
}
