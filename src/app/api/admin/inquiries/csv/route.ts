// GET /api/admin/inquiries/csv?kind=inquiry|quote — 문의/견적 CSV 내보내기(관리자 전용).
// UTF-8 BOM(엑셀 한글 깨짐 방지) + 수식 인젝션 방어(=+-@ 선두 셀에 ' 접두).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { fmtDateTime } from "@/lib/date";

function csvCell(v: string | null | undefined): string {
  let s = (v ?? "").replace(/\r\n|\r/g, "\n");
  // 수식 인젝션 방어 — 엑셀이 수식으로 해석하는 선두 문자 무력화
  if (/^[=+\-@\t]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind = kindParam === "inquiry" || kindParam === "quote" ? kindParam : null;

  const rows = await prisma.inquiry.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { id: "desc" },
  });

  const header = ["ID", "구분", "회사명", "성명", "전화", "휴대폰", "주소", "이메일", "내용", "첨부파일", "접수일시"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        String(r.id),
        r.kind === "quote" ? "견적요청" : "온라인문의",
        r.company,
        r.name,
        r.phone,
        r.mobile,
        r.address,
        r.email,
        r.message,
        r.fileName,
        fmtDateTime(r.createdAt),
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const csv = "\uFEFF" + lines.join("\r\n"); // BOM — 엑셀 UTF-8 인식
  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="samickh-inquiries-${kind ?? "all"}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
