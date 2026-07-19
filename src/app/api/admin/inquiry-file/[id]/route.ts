// GET /api/admin/inquiry-file/[id] — 견적요청 첨부 다운로드(관리자 인증 전용).
// 파일은 var/uploads(공개 밖)에 있으므로 이 라우트가 유일한 접근 경로다(PII 가능 — 무인증 직링크 차단).
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { resolveVarPath, extOf, mimeOf } from "@/lib/uploads";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: idRaw } = await ctx.params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return new NextResponse("Bad Request", { status: 400 });

  const inq = await prisma.inquiry.findUnique({ where: { id } });
  if (!inq?.storeName) return new NextResponse("Not Found", { status: 404 });

  const abs = resolveVarPath(inq.storeName);
  if (!abs) return new NextResponse("Not Found", { status: 404 });

  let buf: Buffer;
  try {
    buf = await readFile(abs);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const downloadName = inq.fileName || `inquiry-${id}`;
  // RFC 5987 — 한글 파일명 안전 인코딩
  const encoded = encodeURIComponent(downloadName).replace(/'/g, "%27");
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": mimeOf(extOf(inq.storeName)),
      "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
