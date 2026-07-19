// /admin/audit-log ⑩ — 감사 로그 조회(읽기 전용, 페이지네이션).
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { fmtDateTime } from "@/lib/date";
import { ui } from "../../ui";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await guardAdminPage();

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 30;

  const [total, rows] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>감사 로그</h1>
      <p className="mt-2 text-[12.5px] text-ink-faint">
        주요 변형 작업(생성·수정·삭제·업로드·로그인) 기록 — 총 {total}건.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-bg-raised">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-line">
              <th className={ui.th}>일시</th>
              <th className={ui.th}>작업</th>
              <th className={ui.th}>대상</th>
              <th className={ui.th}>ID</th>
              <th className={ui.th}>상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={`${ui.td} font-mono text-[12px] tabular-nums text-ink-faint`}>
                  {fmtDateTime(r.createdAt)}
                </td>
                <td className={ui.td}>
                  <span className={ui.chip}>{r.action}</span>
                </td>
                <td className={`${ui.td} font-semibold`}>{r.entity}</td>
                <td className={`${ui.td} font-mono text-[12px] text-ink-dim`}>{r.entityId ?? "-"}</td>
                <td className={`${ui.td} text-ink-dim`}>{r.detail ?? "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[13px] text-ink-faint">
                  기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav aria-label="페이지" className="mt-4 flex flex-wrap items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/audit-log?page=${p}`}
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
