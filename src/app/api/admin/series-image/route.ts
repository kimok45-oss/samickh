// POST /api/admin/series-image — 사업분야 계열 이미지 업로드(관리자 전용, multipart 폼 타깃).
// public/uploads/series/<seriesId>/<난수>.<ext> (이미지 확장자만 + 매직바이트)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit";
import { storePublicFile, IMAGE_EXT } from "@/lib/uploads";

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
