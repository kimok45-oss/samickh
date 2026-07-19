// /admin/series/new — 새 계열. 이미지는 저장 후 편집 화면에서 업로드.
import Link from "next/link";
import { guardAdminPage } from "@/lib/auth-server";
import SeriesForm from "../SeriesForm";
import { ui } from "../../../ui";

export default async function AdminSeriesNewPage() {
  await guardAdminPage();

  return (
    <main className={ui.page}>
      <div className="flex items-center gap-3">
        <h1 className={ui.h1}>새 계열</h1>
        <Link href="/admin/series" className={ui.btnGhost}>목록으로</Link>
      </div>
      <div className="mt-5">
        <SeriesForm series={null} />
      </div>
      <p className="mt-3 text-[12.5px] text-ink-faint">이미지는 저장 후 편집 화면에서 업로드할 수 있습니다.</p>
    </main>
  );
}
