// /admin/clients ⑧b — 주요거래업체 CRUD(원문 4분류 20사 — company_img10 판독).
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteClient, saveClient } from "@/lib/admin-actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { ui } from "../../ui";

const GROUPS: { v: string; label: string }[] = [
  { v: "posco", label: "POSCO 관련" },
  { v: "steel-plant", label: "제철설비관련" },
  { v: "machine", label: "공작기계·산업기계관련" },
  { v: "construction", label: "건설·중장비관련" },
];

export default async function AdminClientsPage() {
  await guardAdminPage();

  const rows = await prisma.client.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>주요거래업체 관리</h1>

      {/* 새 업체 추가 */}
      <form action={saveClient} className={`mt-5 ${ui.panel} flex flex-wrap items-end gap-3`}>
        <div>
          <label className={ui.label} htmlFor="new-group">분류 *</label>
          <select id="new-group" name="group" className={ui.select}>
            {GROUPS.map((g) => (
              <option key={g.v} value={g.v}>{g.label}</option>
            ))}
          </select>
        </div>
        <div className="min-w-52 flex-1">
          <label className={ui.label} htmlFor="new-name">업체명 *</label>
          <input id="new-name" name="name" required className={ui.input} />
        </div>
        <div className="min-w-52 flex-1">
          <label className={ui.label} htmlFor="new-nameEn">업체명(EN)</label>
          <input id="new-nameEn" name="nameEn" className={ui.input} />
        </div>
        <div className="w-20">
          <label className={ui.label} htmlFor="new-sort">정렬</label>
          <input id="new-sort" name="sortOrder" type="number" defaultValue={0} className={ui.input} />
        </div>
        <button type="submit" className={ui.btn}>추가</button>
      </form>

      {GROUPS.map((g) => {
        const groupRows = rows.filter((r) => r.group === g.v);
        return (
          <section key={g.v} className="mt-6">
            <h2 className={ui.h2}>{g.label} <span className="text-ink-faint">({groupRows.length})</span></h2>
            <div className="mt-2 space-y-2">
              {groupRows.map((c) => (
                <div key={c.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-bg-raised px-4 py-3">
                  <form action={saveClient} className="flex flex-1 flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="group" value={c.group} />
                    <div className="min-w-48 flex-1">
                      <label className={ui.label}>업체명</label>
                      <input name="name" defaultValue={c.name} className={ui.input} />
                    </div>
                    <div className="min-w-48 flex-1">
                      <label className={ui.label}>업체명(EN)</label>
                      <input name="nameEn" defaultValue={c.nameEn ?? ""} className={ui.input} />
                    </div>
                    <div className="w-20">
                      <label className={ui.label}>정렬</label>
                      <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={ui.input} />
                    </div>
                    <button type="submit" className={ui.btnSmall}>저장</button>
                  </form>
                  <form action={deleteClient}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmSubmit className={ui.btnSmallDanger} confirmClassName={ui.btnSmallDangerArmed} cancelClassName={ui.btnSmall}>
                      삭제
                    </ConfirmSubmit>
                  </form>
                </div>
              ))}
              {groupRows.length === 0 && (
                <p className="rounded-lg border border-line bg-bg-raised px-4 py-4 text-[13px] text-ink-faint">
                  등록된 업체가 없습니다.
                </p>
              )}
            </div>
          </section>
        );
      })}
    </main>
  );
}
