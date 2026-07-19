// 사업분야 계열 편집 폼(서버 컴포넌트 — 비제어 입력 + 서버액션 saveSeries).
import { saveSeries } from "@/lib/admin-actions";
import { ui } from "../../ui";

type SeriesLike = {
  id: number;
  slug: string;
  name: string;
  nameEn: string | null;
  seriesCode: string;
  kind: string;
  intro: string;
  introEn: string | null;
  specHtml: string;
  specHtmlEn: string | null;
  features: string | null;
  featuresEn: string | null;
  sortOrder: number;
  published: boolean;
} | null;

/** DB의 JSON 배열 문자열 → 관리자 폼 줄단위 텍스트 */
function featuresToLines(json: string | null): string {
  if (!json) return "";
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.join("\n") : "";
  } catch {
    return "";
  }
}

export default function SeriesForm({ series }: { series: SeriesLike }) {
  return (
    <form action={saveSeries} className={`${ui.panel} space-y-4`}>
      {series && <input type="hidden" name="id" value={series.id} />}

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={ui.label} htmlFor="slug">슬러그(비우면 자동)</label>
          <input id="slug" name="slug" defaultValue={series?.slug ?? ""} className={ui.input} />
        </div>
        <div>
          <label className={ui.label} htmlFor="seriesCode">시리즈 코드</label>
          <input id="seriesCode" name="seriesCode" defaultValue={series?.seriesCode ?? ""} className={ui.input} placeholder="SS 70H, SS 140H" />
        </div>
        <div>
          <label className={ui.label} htmlFor="kind">구분</label>
          <select id="kind" name="kind" defaultValue={series?.kind ?? "hydraulic"} className={`${ui.select} w-full`}>
            <option value="hydraulic">유압(hydraulic)</option>
            <option value="pneumatic">공압(pneumatic)</option>
          </select>
        </div>
        <div>
          <label className={ui.label} htmlFor="sortOrder">정렬</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={series?.sortOrder ?? 0} className={ui.input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="name">계열명 *</label>
          <input id="name" name="name" required defaultValue={series?.name ?? ""} className={ui.input} />
        </div>
        <div>
          <label className={ui.label} htmlFor="nameEn">계열명(EN — 원문 표기 그대로)</label>
          <input id="nameEn" name="nameEn" defaultValue={series?.nameEn ?? ""} className={ui.input} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="intro">소개 문단(원문)</label>
          <textarea id="intro" name="intro" rows={5} defaultValue={series?.intro ?? ""} className={ui.textarea} />
        </div>
        <div>
          <label className={ui.label} htmlFor="introEn">소개 문단(EN)</label>
          <textarea id="introEn" name="introEn" rows={5} defaultValue={series?.introEn ?? ""} className={ui.textarea} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="features">특징/특수사양(한 줄에 하나)</label>
          <textarea id="features" name="features" rows={5} defaultValue={featuresToLines(series?.features ?? null)} className={ui.textarea} />
        </div>
        <div>
          <label className={ui.label} htmlFor="featuresEn">특징(EN — 한 줄에 하나)</label>
          <textarea id="featuresEn" name="featuresEn" rows={5} defaultValue={featuresToLines(series?.featuresEn ?? null)} className={ui.textarea} />
        </div>
      </div>

      <div>
        <label className={ui.label} htmlFor="specHtml">스펙표 HTML(원문 — 공개 렌더에서 정화)</label>
        <textarea id="specHtml" name="specHtml" rows={12} defaultValue={series?.specHtml ?? ""} className={ui.textarea} />
      </div>
      <div>
        <label className={ui.label} htmlFor="specHtmlEn">스펙표 HTML(EN)</label>
        <textarea id="specHtmlEn" name="specHtmlEn" rows={6} defaultValue={series?.specHtmlEn ?? ""} className={ui.textarea} />
      </div>

      <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-dim">
        <input type="checkbox" name="published" defaultChecked={series?.published ?? true} className="h-4 w-4" />
        공개
      </label>

      <button type="submit" className={ui.btn}>저장</button>
    </form>
  );
}
