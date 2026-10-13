// POST /api/admin/attachments — 게시글 첨부 업로드(관리자 전용, multipart 폼 타깃).
//  - 신규 첨부: files[] → public/uploads/attach/admin/<postId>/<난수>.<ext> + Attachment 행 생성
//  - missing 첨부 복원: replaceId 지정 시 실파일 저장 후 storeName 갱신 + missing 해제(CAD zip 5건 복원 경로)
// 서버액션이 아닌 이유: bodySizeLimit(1MB) — 카탈로그 PDF는 4~5MB(next.config 수정 금지 계약).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit";
import { storePublicFile } from "@/lib/uploads";

// 2026-10-12 오너 '함께 발견한 거 고쳐 줘'(ITEM 2): Location 을 상대 경로로 보낸다(RFC 9110 허용, 같은 출처로 이동).
//   예전 `new URL(path, req.url)` 은 Next 16 운영(next start)에서 req.url 이 서버 내부 오리진이라
//   Host: www.samickh.co.kr 로 불러도 `https://localhost:5700/admin/...` 로 보냈다(업로드 후 관리자 화면 이탈).
//   path 는 이 파일 안의 고정 문자열·숫자 id·오류 코드로만 만들어지므로 외부 입력이 Location 에 들어가지 않는다.
//   (req 인자는 호출부 모양을 그대로 두려고 남긴다.)
function back(_req: NextRequest, path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return back(req, "/admin/login");
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const postId = Number(fd.get("postId"));
  if (!Number.isInteger(postId)) return new NextResponse("Bad Request", { status: 400 });
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return new NextResponse("Not Found", { status: 404 });

  const subdir = `attach/admin/${postId}`;
  const replaceId = Number(fd.get("replaceId"));

  // ── missing 첨부 실파일 복원 ──
  if (Number.isInteger(replaceId) && replaceId > 0) {
    const att = await prisma.attachment.findUnique({ where: { id: replaceId } });
    if (!att || att.postId !== postId) return new NextResponse("Not Found", { status: 404 });
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return back(req, `/admin/posts/${postId}?err=nofile`);
    }
    const { stored, err } = await storePublicFile(file, subdir);
    if (err) return back(req, `/admin/posts/${postId}?err=${err}`);
    await prisma.attachment.update({
      where: { id: att.id },
      data: {
        storeName: stored!.storeName,
        mime: stored!.mime,
        size: stored!.size,
        missing: false, // 실파일 업로드 → missing 해제
      },
    });
    await logAudit("restore", "Attachment", att.id, `${att.fileName} 실파일 복원`);
    return back(req, `/admin/posts/${postId}?attsaved=1`);
  }

  // ── 신규 첨부 ──
  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return back(req, `/admin/posts/${postId}?err=nofile`);
  let lastErr = "";
  let saved = 0;
  for (const f of files.slice(0, 5)) {
    const { stored, err } = await storePublicFile(f, subdir);
    if (err) {
      lastErr = err;
      continue;
    }
    await prisma.attachment.create({
      data: {
        postId,
        fileName: stored!.fileName,
        storeName: stored!.storeName,
        mime: stored!.mime,
        size: stored!.size,
        missing: false,
      },
    });
    saved++;
  }
  if (saved > 0) await logAudit("upload", "Attachment", postId, `${saved}건 업로드`);
  return back(req, `/admin/posts/${postId}?${lastErr ? `err=${lastErr}` : "attsaved=1"}`);
}
