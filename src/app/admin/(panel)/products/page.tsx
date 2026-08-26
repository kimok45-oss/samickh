// /admin/products ⑦ — 제품(원문 제품소개 게시판 13건: 사양·외형치수표) CRUD.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteProduct } from "@/lib/admin-actions";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { ui } from "../../ui";

const CATS: Record<number, string> = {
  1: "표준 유압실린더",
  2: "제철용 강력 실린더",
  3: "공압 실린더",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; err?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const cat = [1, 2, 3].includes(Number(sp.cat)) ? Number(sp.cat) : 0;

  const items = await prisma.product.findMany({
    where: cat ? { category: cat } : undefined,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { id: "asc" }],
    include: { images: { select: { id: true } } },
  });

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>제품 관리</h1>
        <Link href="/admin/products/new" className={ui.btn}>새 제품</Link>
      </div>

      {sp.err && <p className={`mt-4 ${ui.err}`}>저장에 실패했습니다({sp.err}).</p>}

      <div className="mt-5 flex flex-wrap gap-1.5">
        <Link href="/admin/products" className={ui.tab(cat === 0)}>전체</Link>
        {[1, 2, 3].map((c) => (
          <Link key={c} href={`/admin/products?cat=${c}`} className={ui.tab(cat === c)}>
            {CATS[c]}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-bg-raised">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={ui.th}>슬러그</th>
              <th className={ui.th}>분류</th>
              <th className={ui.th}>제목</th>
              <th className={ui.th}>이미지</th>
              <th className={ui.th}>정렬</th>
              <th className={ui.th}>공개</th>
              <th className={ui.th}>관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((p) => (
              <tr key={p.id}>
                <td className={`${ui.td} font-mono text-[12px] text-ink-faint`}>{p.slug}</td>
                <td className={`${ui.td} text-ink-dim`}>{CATS[p.category] ?? p.category}</td>
                <td className={ui.td}>
                  <Link href={`/admin/products/${p.id}`} className="font-semibold hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className={`${ui.td} font-mono tabular-nums text-ink-dim`}>{p.images.length}</td>
                <td className={`${ui.td} font-mono tabular-nums text-ink-dim`}>{p.sortOrder}</td>
                <td className={`${ui.td} text-ink-dim`}>{p.published ? "공개" : "비공개"}</td>
                <td className={ui.td}>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/admin/products/${p.id}`} className={ui.btnSmall}>수정</Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit className={ui.btnSmallDanger} confirmClassName={ui.btnSmallDangerArmed} cancelClassName={ui.btnSmall}>
                        삭제
                      </ConfirmSubmit>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-ink-faint">
                  제품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
