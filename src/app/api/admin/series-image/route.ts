// POST /api/admin/series-image — 사업분야 계열 이미지 업로드(관리자 전용, multipart 폼 타깃).
// public/uploads/series/<seriesId>/<난수>.<ext> (이미지 확장자만 + 매직바이트)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit";
import { storePublicFile, IMAGE_EXT } from "@/lib/uploads";

function back(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
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

  const seriesId = Number(fd.get("seriesId"));
  if (!Number.isInteger(seriesId)) return new NextResponse("Bad Request", { status: 400 });
  const series = await prisma.series.findUnique({ where: { id: seriesId } });
  if (!series) return new NextResponse("Not Found", { status: 404 });

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return back(req, `/admin/series/${seriesId}?err=nofile`);
  }
  const { stored, err } = await storePublicFile(file, `series/${seriesId}`, IMAGE_EXT);
  if (err) return back(req, `/admin/series/${seriesId}?err=${err}`);

  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200) || null;
  const sortOrder = Number.isInteger(Number(fd.get("sortOrder"))) ? Number(fd.get("sortOrder")) : 0;
  await prisma.seriesImage.create({
    data: { seriesId, path: stored!.storeName, alt, sortOrder },
  });
  await logAudit("upload", "SeriesImage", seriesId, stored!.storeName);
  return back(req, `/admin/series/${seriesId}?imgsaved=1`);
}
