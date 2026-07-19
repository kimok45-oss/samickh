// /admin/site-content ③ — SiteContent group별 폼(DB 메타 label/multiline/sortOrder 자동 렌더).
// [확인필요] 항목(대표자명·이메일 등)은 label에 표기되어 있음 — 값이 오면 여기서 채운다(날조 금지).
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { saveSiteContent } from "@/lib/admin-actions";
import { ui } from "../../ui";

const GROUP_LABEL: Record<string, string> = {
  basic: "회사 기본",
  brand: "브랜드/슬로건",
  company: "회사소개",
  contact: "연락처",
  policy: "정책(개인정보처리방침)",
  general: "기타",
};

export default async function AdminSiteContentPage() {
  await guardAdminPage();

  const rows = await prisma.siteContent.findMany({
    orderBy: [{ group: "asc" }, { sortOrder: "asc" }],
  });
  const groups = [...new Set(rows.map((r) => r.group))];

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>사이트 문구 관리</h1>
      <p className="mt-2 text-[12.5px] text-ink-faint">
        공개면 문구의 정본입니다. 라벨에 [확인필요]가 표기된 항목은 회사가 값을 준 뒤 채워
        주세요 — 임의로 지어 넣지 않습니다. EN을 비우면 공개면에서 국문으로 폴백됩니다.
      </p>

      <div className="mt-6 space-y-6">
        {groups.map((g) => {
          const groupRows = rows.filter((r) => r.group === g);
          return (
            <form key={g} action={saveSiteContent} className={ui.panel}>
              <input type="hidden" name="group" value={g} />
              <h2 className={ui.h2}>{GROUP_LABEL[g] ?? g}</h2>
              <div className="mt-4 space-y-4">
                {groupRows.map((r) => (
                  <div key={r.key} className="grid gap-3 lg:grid-cols-2">
                    <div>
                      <label className={ui.label} htmlFor={`value_${r.key}`}>
                        {r.label || r.key} <span className="font-mono text-ink-faint">({r.key})</span>
                      </label>
                      {r.multiline ? (
                        <textarea
                          id={`value_${r.key}`}
                          name={`value_${r.key}`}
                          rows={5}
                          defaultValue={r.value}
                          className={ui.textarea}
                        />
                      ) : (
                        <input
                          id={`value_${r.key}`}
                          name={`value_${r.key}`}
                          defaultValue={r.value}
                          className={ui.input}
                        />
                      )}
                    </div>
                    <div>
                      <label className={ui.label} htmlFor={`valueEn_${r.key}`}>
                        EN(비우면 국문 폴백)
                      </label>
                      {r.multiline ? (
                        <textarea
                          id={`valueEn_${r.key}`}
                          name={`valueEn_${r.key}`}
                          rows={5}
                          defaultValue={r.valueEn ?? ""}
                          className={ui.textarea}
                        />
                      ) : (
                        <input
                          id={`valueEn_${r.key}`}
                          name={`valueEn_${r.key}`}
                          defaultValue={r.valueEn ?? ""}
                          className={ui.input}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button type="submit" className={ui.btn}>이 그룹 저장</button>
              </div>
            </form>
          );
        })}
      </div>
    </main>
  );
}
