// /admin/series ⑧ — 사업분야 10계열(content.php 10p 원문) CRUD.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteSeries } from "@/lib/admin-actions";
import { ui } from "../../ui";

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const items = await prisma.series.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { images: { select: { id: true } } },
  });

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>사업분야 관리</h1>
        <Link href="/admin/series/new" className={ui.btn}>새 계열</Link>
      </div>

      {sp.err && <p className={`mt-4 ${ui.err}`}>저장에 실패했습니다({sp.err}).</p>}

      <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-bg-raised">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={ui.th}>슬러그</th>
              <th className={ui.th}>계열명</th>
              <th className={ui.th}>시리즈</th>
              <th className={ui.th}>구분</th>
              <th className={ui.th}>이미지</th>
              <th className={ui.th}>공개</th>
              <th className={ui.th}>관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((s) => (
              <tr key={s.id}>
                <td className={`${ui.td} font-mono text-[12px] text-ink-faint`}>{s.slug}</td>
                <td className={ui.td}>
                  <Link href={`/admin/series/${s.id}`} className="font-semibold hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className={`${ui.td} font-mono text-[12.5px] text-ink-dim`}>{s.seriesCode}</td>
                <td className={`${ui.td} text-ink-dim`}>{s.kind === "pneumatic" ? "공압" : "유압"}</td>
                <td className={`${ui.td} font-mono tabular-nums text-ink-dim`}>{s.images.length}</td>
                <td className={`${ui.td} text-ink-dim`}>{s.published ? "공개" : "비공개"}</td>
                <td className={ui.td}>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/series/${s.id}`} className={ui.btnSmall}>수정</Link>
                    <form action={deleteSeries}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className={ui.btnSmallDanger}>삭제</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
