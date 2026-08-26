// /admin/history ⑤ — 연혁 CRUD(원문 14건 + 추가/수정/삭제).
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteHistory, saveHistory } from "@/lib/admin-actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { ui } from "../../ui";

export default async function AdminHistoryPage() {
  await guardAdminPage();

  const rows = await prisma.history.findMany({
    orderBy: [{ year: "desc" }, { sortOrder: "asc" }],
  });

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>연혁 관리</h1>

      {/* 새 항목 추가 */}
      <form action={saveHistory} className={`mt-5 ${ui.panel} flex flex-wrap items-end gap-3`}>
        <div className="w-24">
          <label className={ui.label} htmlFor="new-year">연도 *</label>
          <input id="new-year" name="year" type="number" required min={1900} max={2100} className={ui.input} />
        </div>
        <div className="min-w-64 flex-1">
          <label className={ui.label} htmlFor="new-text">내용 *</label>
          <input id="new-text" name="text" required className={ui.input} />
        </div>
        <div className="min-w-64 flex-1">
          <label className={ui.label} htmlFor="new-textEn">내용(EN)</label>
          <input id="new-textEn" name="textEn" className={ui.input} />
        </div>
        <div className="w-20">
          <label className={ui.label} htmlFor="new-sort">정렬</label>
          <input id="new-sort" name="sortOrder" type="number" defaultValue={0} className={ui.input} />
        </div>
        <button type="submit" className={ui.btn}>추가</button>
      </form>

      {/* 기존 항목 인라인 편집 */}
      <div className="mt-5 space-y-2">
        {rows.map((h) => (
          <div key={h.id} className="rounded-lg border border-line bg-bg-raised px-4 py-3">
            <form action={saveHistory} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={h.id} />
              <div className="w-24">
                <label className={ui.label}>연도</label>
                <input name="year" type="number" defaultValue={h.year} min={1900} max={2100} className={ui.input} />
              </div>
              <div className="min-w-64 flex-1">
                <label className={ui.label}>내용</label>
                <input name="text" defaultValue={h.text} className={ui.input} />
              </div>
              <div className="min-w-64 flex-1">
                <label className={ui.label}>내용(EN)</label>
                <input name="textEn" defaultValue={h.textEn ?? ""} className={ui.input} />
              </div>
              <div className="w-20">
                <label className={ui.label}>정렬</label>
                <input name="sortOrder" type="number" defaultValue={h.sortOrder} className={ui.input} />
              </div>
              <button type="submit" className={ui.btnSmall}>저장</button>
            </form>
            <form action={deleteHistory} className="mt-2 text-right">
              <input type="hidden" name="id" value={h.id} />
              <ConfirmSubmit className={ui.btnSmallDanger} confirmClassName={ui.btnSmallDangerArmed} cancelClassName={ui.btnSmall}>
                삭제
              </ConfirmSubmit>
            </form>
          </div>
        ))}
      </div>
    </main>
  );
}
