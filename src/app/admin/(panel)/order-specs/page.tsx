// /admin/order-specs ⑨ — 주문사양 표 편집(BoreRod 13행 · Mounting 10종 — 카탈로그 p.11 원문).
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import {
  deleteBoreRod,
  deleteMounting,
  saveBoreRod,
  saveMounting,
} from "@/lib/admin-actions";
import { ui } from "../../ui";

export default async function AdminOrderSpecsPage() {
  await guardAdminPage();

  const [bores, mountings] = await Promise.all([
    prisma.boreRod.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mounting.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>주문사양 관리</h1>
      <p className="mt-2 text-[12.5px] text-ink-faint">
        홈 히어로·주문방법(/products/order-guide)에 렌더되는 원문 표(카탈로그 실측)입니다.
      </p>

      {/* ── 보어/로드 표 ── */}
      <section className="mt-6">
        <h2 className={ui.h2}>호칭경·로드경(BoreRod) — {bores.length}행</h2>
        <div className="mt-2 space-y-2">
          {bores.map((b) => (
            <div key={b.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-bg-raised px-4 py-3">
              <form action={saveBoreRod} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={b.id} />
                <Field label="호칭경 코드" name="code" defaultValue={b.code} w="w-24" />
                <Field label="튜브내경(mm)" name="bore" type="number" step="0.1" defaultValue={b.bore} w="w-28" />
                <Field label="로드경 B(mm)" name="rodB" type="number" step="0.1" defaultValue={b.rodB} w="w-28" />
                <Field label="로드경 C(mm)" name="rodC" type="number" step="0.1" defaultValue={b.rodC} w="w-28" />
                <Field label="정렬" name="sortOrder" type="number" defaultValue={b.sortOrder} w="w-20" />
                <button type="submit" className={ui.btnSmall}>저장</button>
              </form>
              <form action={deleteBoreRod}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className={ui.btnSmallDanger}>삭제</button>
              </form>
            </div>
          ))}
        </div>
        <form action={saveBoreRod} className={`mt-3 ${ui.panel} flex flex-wrap items-end gap-3`}>
          <Field label="호칭경 코드 *" name="code" w="w-24" required />
          <Field label="튜브내경(mm) *" name="bore" type="number" step="0.1" w="w-28" required />
          <Field label="로드경 B(mm) *" name="rodB" type="number" step="0.1" w="w-28" required />
          <Field label="로드경 C(mm) *" name="rodC" type="number" step="0.1" w="w-28" required />
          <Field label="정렬" name="sortOrder" type="number" defaultValue={0} w="w-20" />
          <button type="submit" className={ui.btn}>행 추가</button>
        </form>
      </section>

      {/* ── 장착형식 표 ── */}
      <section className="mt-8">
        <h2 className={ui.h2}>장착형식(Mounting) — {mountings.length}종</h2>
        <div className="mt-2 space-y-2">
          {mountings.map((m) => (
            <div key={m.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-bg-raised px-4 py-3">
              <form action={saveMounting} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={m.id} />
                <Field label="코드" name="code" defaultValue={m.code} w="w-20" />
                <div className="min-w-52 flex-1">
                  <label className={ui.label}>명칭</label>
                  <input name="name" defaultValue={m.name} className={ui.input} />
                </div>
                <div className="min-w-52 flex-1">
                  <label className={ui.label}>명칭(EN)</label>
                  <input name="nameEn" defaultValue={m.nameEn ?? ""} className={ui.input} />
                </div>
                <Field label="정렬" name="sortOrder" type="number" defaultValue={m.sortOrder} w="w-20" />
                <button type="submit" className={ui.btnSmall}>저장</button>
              </form>
              <form action={deleteMounting}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className={ui.btnSmallDanger}>삭제</button>
              </form>
            </div>
          ))}
        </div>
        <form action={saveMounting} className={`mt-3 ${ui.panel} flex flex-wrap items-end gap-3`}>
          <Field label="코드 *" name="code" w="w-20" required />
          <div className="min-w-52 flex-1">
            <label className={ui.label}>명칭 *</label>
            <input name="name" required className={ui.input} />
          </div>
          <div className="min-w-52 flex-1">
            <label className={ui.label}>명칭(EN)</label>
            <input name="nameEn" className={ui.input} />
          </div>
          <Field label="정렬" name="sortOrder" type="number" defaultValue={0} w="w-20" />
          <button type="submit" className={ui.btn}>종 추가</button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  w = "w-28",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  w?: string;
  required?: boolean;
}) {
  return (
    <div className={w}>
      <label className={ui.label}>{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className={ui.input}
      />
    </div>
  );
}
