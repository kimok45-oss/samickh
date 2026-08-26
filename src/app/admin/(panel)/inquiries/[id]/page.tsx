// /admin/inquiries/[id] — 문의/견적 상세 + 첨부 다운로드(인증 라우트) + 삭제(PII 파기).
import Link from "next/link";
import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteInquiry } from "@/lib/admin-actions";
import { fmtDateTime } from "@/lib/date";
import ConfirmSubmit from "@/components/ConfirmSubmit";
import { ui } from "../../../ui";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await guardAdminPage();

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();

  const q = await prisma.inquiry.findUnique({ where: { id } });
  if (!q) notFound();

  const rows: { label: string; value: string | null }[] = [
    { label: "구분", value: q.kind === "quote" ? "견적요청" : "온라인문의" },
    { label: "회사명", value: q.company },
    { label: "성명", value: q.name },
    { label: "전화", value: q.phone },
    { label: "휴대폰", value: q.mobile },
    { label: "주소", value: q.address },
    { label: "이메일", value: q.email },
    { label: "접수일시", value: fmtDateTime(q.createdAt) },
  ];

  return (
    <main className={ui.page}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className={ui.h1}>
          {q.kind === "quote" ? "견적요청" : "온라인문의"} <span className="text-ink-faint">#{q.id}</span>
        </h1>
        <Link href="/admin/inquiries" className={ui.btnGhost}>목록으로</Link>
        <form action={deleteInquiry} className="ml-auto">
          <input type="hidden" name="id" value={q.id} />
          {/* 개인정보 파기 경로 — 오클릭 1번에 첨부 실파일까지 사라지므로 2단 확인을 건다. */}
          <ConfirmSubmit
            className={ui.btnGhost}
            confirmLabel="정말 파기"
            confirmClassName={ui.btnGhostArmed}
            cancelClassName={ui.btnGhost}
          >
            삭제(PII 파기)
          </ConfirmSubmit>
        </form>
      </div>

      <div className={`mt-5 ${ui.panel}`}>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="flex gap-3 text-[13.5px]">
              <dt className="w-20 shrink-0 font-bold text-ink-faint">{r.label}</dt>
              <dd className="text-ink">{r.value || "-"}</dd>
            </div>
          ))}
        </dl>

        {q.fileName && (
          <p className="mt-4 border-t border-line pt-4 text-[13.5px]">
            <span className="mr-3 font-bold text-ink-faint">첨부</span>
            {q.storeName ? (
              <a
                href={`/api/admin/inquiry-file/${q.id}`}
                className="font-semibold underline-offset-2 hover:underline"
              >
                {q.fileName}
              </a>
            ) : (
              <span className="text-ink-dim">{q.fileName}(파일 없음)</span>
            )}
            <span className="ml-2 text-[11.5px] text-ink-faint">— 공개 밖(var/uploads)·관리자 인증 다운로드</span>
          </p>
        )}

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[12px] font-bold text-ink-faint">내용</p>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">{q.message}</p>
        </div>
      </div>
    </main>
  );
}
