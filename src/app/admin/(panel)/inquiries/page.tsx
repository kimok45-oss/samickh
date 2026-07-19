// /admin/inquiries ② — 문의/견적 목록(kind 필터) + CSV 내보내기.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fmtDateTime } from "@/lib/date";
import { ui } from "../../ui";

const KINDS = [
  { v: "", label: "전체" },
  { v: "inquiry", label: "온라인문의" },
  { v: "quote", label: "견적요청" },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; page?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const kind = sp.kind === "inquiry" || sp.kind === "quote" ? sp.kind : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 20;
  const where = kind ? { kind } : undefined;

  const [total, items] = await Promise.all([
    prisma.inquiry.count({ where }),
    prisma.inquiry.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>문의/견적 관리</h1>
        <a href={`/api/admin/inquiries/csv${kind ? `?kind=${kind}` : ""}`} className={ui.btnGhost}>
          CSV 내보내기
        </a>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <Link key={k.v} href={`/admin/inquiries${k.v ? `?kind=${k.v}` : ""}`} className={ui.tab(k.v === kind)}>
            {k.label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[12.5px] font-semibold text-ink-faint">
        총 {total}건 · {page}/{totalPages} 페이지 · 삭제 시 첨부 실파일 포함 PII가 파기됩니다.
      </p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-line bg-bg-raised">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={ui.th}>구분</th>
              <th className={ui.th}>성명</th>
              <th className={ui.th}>회사명</th>
              <th className={ui.th}>연락처</th>
              <th className={ui.th}>첨부</th>
              <th className={ui.th}>접수일시</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items.map((q) => (
              <tr key={q.id}>
                <td className={ui.td}>
                  <span className={ui.chip}>{q.kind === "quote" ? "견적" : "문의"}</span>
                </td>
                <td className={ui.td}>
                  <Link href={`/admin/inquiries/${q.id}`} className="font-semibold hover:underline">
                    {q.name}
                  </Link>
                </td>
                <td className={`${ui.td} text-ink-dim`}>{q.company ?? "-"}</td>
                <td className={`${ui.td} font-mono text-[12.5px] text-ink-dim`}>
                  {q.phone || q.mobile || q.email || "-"}
                </td>
                <td className={`${ui.td} text-ink-dim`}>{q.fileName ? "있음" : "-"}</td>
                <td className={`${ui.td} font-mono text-[12px] tabular-nums text-ink-faint`}>
                  {fmtDateTime(q.createdAt)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-ink-faint">
                  접수된 문의가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="페이지" className="mt-4 flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/inquiries?${kind ? `kind=${kind}&` : ""}page=${p}`}
              aria-current={p === page ? "page" : undefined}
              className={ui.tab(p === page)}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
