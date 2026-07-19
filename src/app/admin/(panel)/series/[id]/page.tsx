// /admin/series/[id] — 계열 편집 + 이미지(SeriesImage) 업로드/삭제.
import Link from "next/link";
import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { deleteSeriesImage } from "@/lib/admin-actions";
import SeriesForm from "../SeriesForm";
import { ui } from "../../../ui";

const ERR_LABEL: Record<string, string> = {
  nofile: "파일을 선택해 주세요.",
  ext: "이미지 파일(jpg·jpeg·png·gif)만 업로드할 수 있습니다.",
  magic: "파일 내용이 확장자와 일치하지 않습니다.",
  toobig: "20MB 이하 파일만 업로드할 수 있습니다.",
};

export default async function AdminSeriesEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ err?: string; saved?: string; imgsaved?: string }>;
}) {
  await guardAdminPage();

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) notFound();

  const series = await prisma.series.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!series) notFound();

  const sp = await searchParams;

  return (
    <main className={ui.page}>
      <div className="flex items-center gap-3">
        <h1 className={ui.h1}>계열 편집 <span className="text-ink-faint">#{series.id}</span></h1>
        <Link href="/admin/series" className={ui.btnGhost}>목록으로</Link>
      </div>

      {(sp.saved || sp.imgsaved) && <p className={`mt-4 ${ui.err}`}>저장되었습니다.</p>}
      {sp.err && <p className={`mt-4 ${ui.err}`}>{ERR_LABEL[sp.err] ?? "저장에 실패했습니다."}</p>}

      <div className="mt-5">
        <SeriesForm series={series} />
      </div>

      {/* ── 이미지 관리 ── */}
      <section className={`mt-5 ${ui.panel}`}>
        <h2 className={ui.h2}>계열 이미지</h2>

        {series.images.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-faint">등록된 이미지가 없습니다.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {series.images.map((img) => (
              <li key={img.id} className="rounded border border-line bg-bg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={encodeURI(img.path)}
                  alt={img.alt ?? series.name}
                  className="h-32 w-full rounded object-contain"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-ink-faint">{img.alt ?? "-"}</span>
                  <form action={deleteSeriesImage}>
                    <input type="hidden" name="id" value={img.id} />
                    <button type="submit" className={ui.btnSmallDanger}>삭제</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form
          action="/api/admin/series-image"
          method="post"
          encType="multipart/form-data"
          className="mt-4 flex flex-wrap items-end gap-3 rounded border border-line bg-bg-panel px-4 py-3"
        >
          <input type="hidden" name="seriesId" value={series.id} />
          <div>
            <label className={ui.label}>이미지 파일(jpg·png·gif)</label>
            <input type="file" name="file" accept="image/jpeg,image/png,image/gif" required className="text-[12.5px] text-ink-dim" />
          </div>
          <div className="min-w-40">
            <label className={ui.label}>대체 텍스트(alt)</label>
            <input name="alt" className={ui.input} />
          </div>
          <div className="w-20">
            <label className={ui.label}>정렬</label>
            <input name="sortOrder" type="number" defaultValue={0} className={ui.input} />
          </div>
          <button type="submit" className={ui.btnSmall}>업로드</button>
        </form>
      </section>
    </main>
  );
}
