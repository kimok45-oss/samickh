// GET /uploads/<attach/admin|products|series>/... — 관리자 런타임 업로드 서빙.
//
// 2026-10-11 오너 '1번부터'(전체점검 공통 고장 B): `next start` 는 서버를 켤 때 public/ 에 있던 파일만
//   정적으로 내보낸다. 관리자가 실행 중에 올린 첨부(CAD 5건 복원 포함)·제품/계열 이미지는 public/uploads 에
//   저장되지만 재시작 전까지 404 였다(dev 에서는 보여서 화면 검수로 안 잡힘).
//   빌드 시점에 있던 파일은 정적 서빙이 먼저 먹고, 나머지가 이 라우트로 온다.
//   정본 = C:\Github\cardex\src\app\uploads\[...path]\route.ts
// · 경로는 resolveRuntimeUploadPath 가 public/uploads 의 런타임 하위 경로 안으로 못 박는다(탐색·잘못된 확장자 → 404).
// · 견적 첨부(PII 가능)는 var/uploads 라 이 라우트로는 나가지 않는다(관리자 인증 /api/admin/inquiry-file 전용).
// · proxy.ts matcher 가 `uploads/` 를 제외하므로 언어 쿠키·관리자 가드가 끼어들지 않는다.
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { RANDOM_UPLOAD_NAME, SERVE_TYPES, resolveRuntimeUploadPath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const notFound = () => new Response("Not Found", { status: 404 });

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }): Promise<Response> {
  const { path: segments } = await ctx.params;
  const hit = resolveRuntimeUploadPath(segments);
  if (!hit) return notFound();
  const type = SERVE_TYPES[hit.ext];
  try {
    const st = await stat(hit.abs);
    if (!st.isFile()) return notFound();
    const buf = await readFile(hit.abs);
    const headers: Record<string, string> = {
      "content-type": type.mime,
      "content-length": String(buf.byteLength),
      // 난수 파일명(storePublicFile)만 1년 immutable — 그 밖의 이름은 짧게.
      "cache-control": RANDOM_UPLOAD_NAME.test(path.basename(hit.abs))
        ? "public, max-age=31536000, immutable"
        : "public, max-age=300",
      "x-content-type-options": "nosniff",
    };
    // CAD·압축은 브라우저가 열지 않고 내려받게(표시 파일명은 링크의 download 속성이 정한다).
    if (type.download) headers["content-disposition"] = "attachment";
    return new Response(new Uint8Array(buf), { headers });
  } catch {
    return notFound();
  }
}
