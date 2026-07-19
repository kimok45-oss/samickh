// /admin/faqs ⑫ — FAQ CRUD. 원문에 FAQ 없음(0건) — 공개면(/support/faq)은 published 1건 이상일 때만 열린다.
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteFaq, saveFaq } from "@/lib/admin-actions";
import { ui } from "../../ui";

export default async function AdminFaqsPage() {
  await guardAdminPage();

  const rows = await prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  const publishedCount = rows.filter((f) => f.published).length;

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>FAQ 관리</h1>
      <p className="mt-2 text-[12.5px] text-ink-faint">
        공개 FAQ가 0건이면 /support/faq 는 404로 닫혀 있습니다(현재 공개 {publishedCount}건).
        1건 이상 공개로 저장하면 페이지가 열립니다.
      </p>

      {/* 새 FAQ */}
      <form action={saveFaq} className={`mt-5 ${ui.panel} space-y-3`}>
        <h2 className={ui.h2}>새 FAQ</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <label className={ui.label} htmlFor="new-q">질문 *</label>
            <input id="new-q" name="question" required className={ui.input} />
          </div>
          <div>
            <label className={ui.label} htmlFor="new-qEn">질문(EN)</label>
            <input id="new-qEn" name="questionEn" className={ui.input} />
          </div>
          <div>
            <label className={ui.label} htmlFor="new-a">답변 *</label>
            <textarea id="new-a" name="answer" rows={4} required className={ui.textarea} />
          </div>
          <div>
            <label className={ui.label} htmlFor="new-aEn">답변(EN)</label>
            <textarea id="new-aEn" name="answerEn" rows={4} className={ui.textarea} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-dim">
            <input type="checkbox" name="published" defaultChecked className="h-4 w-4" /> 공개
          </label>
          <div className="w-20">
            <input name="sortOrder" type="number" defaultValue={0} className={ui.input} aria-label="정렬" />
          </div>
          <button type="submit" className={ui.btn}>추가</button>
        </div>
      </form>

      {/* 기존 FAQ */}
      <div className="mt-6 space-y-3">
        {rows.map((f) => (
          <div key={f.id} className={ui.panel}>
            <form action={saveFaq} className="space-y-3">
              <input type="hidden" name="id" value={f.id} />
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <label className={ui.label}>질문</label>
                  <input name="question" defaultValue={f.question} className={ui.input} />
                </div>
                <div>
                  <label className={ui.label}>질문(EN)</label>
                  <input name="questionEn" defaultValue={f.questionEn ?? ""} className={ui.input} />
                </div>
                <div>
                  <label className={ui.label}>답변</label>
                  <textarea name="answer" rows={4} defaultValue={f.answer} className={ui.textarea} />
                </div>
                <div>
                  <label className={ui.label}>답변(EN)</label>
                  <textarea name="answerEn" rows={4} defaultValue={f.answerEn ?? ""} className={ui.textarea} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-dim">
                  <input type="checkbox" name="published" defaultChecked={f.published} className="h-4 w-4" /> 공개
                </label>
                <div className="w-20">
                  <input name="sortOrder" type="number" defaultValue={f.sortOrder} className={ui.input} aria-label="정렬" />
                </div>
                <button type="submit" className={ui.btnSmall}>저장</button>
              </div>
            </form>
            <form action={deleteFaq} className="mt-2 text-right">
              <input type="hidden" name="id" value={f.id} />
              <button type="submit" className={ui.btnSmallDanger}>삭제</button>
            </form>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-lg border border-line bg-bg-raised px-4 py-6 text-center text-[13px] text-ink-faint">
            등록된 FAQ가 없습니다.
          </p>
        )}
      </div>
    </main>
  );
}
