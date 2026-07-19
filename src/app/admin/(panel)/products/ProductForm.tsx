// 제품 편집 폼(서버 컴포넌트 — 비제어 입력 + 서버액션 saveProduct).
import { saveProduct } from "@/lib/admin-actions";
import { ui } from "../../ui";

type ProductLike = {
  id: number;
  slug: string;
  category: number;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  sortOrder: number;
  published: boolean;
} | null;

export default function ProductForm({ product }: { product: ProductLike }) {
  return (
    <form action={saveProduct} className={`${ui.panel} space-y-4`}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={ui.label} htmlFor="category">분류</label>
          <select id="category" name="category" defaultValue={product?.category ?? 1} className={`${ui.select} w-full`}>
            <option value={1}>표준 유압실린더</option>
            <option value={2}>제철용 강력 실린더</option>
            <option value={3}>공압 실린더</option>
          </select>
        </div>
        <div>
          <label className={ui.label} htmlFor="slug">슬러그(영문/숫자/하이픈, 비우면 자동)</label>
          <input id="slug" name="slug" defaultValue={product?.slug ?? ""} className={ui.input} placeholder="ss70h-spec" />
        </div>
        <div>
          <label className={ui.label} htmlFor="sortOrder">정렬</label>
          <input id="sortOrder" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} className={ui.input} />
        </div>
      </div>

      <div>
        <label className={ui.label} htmlFor="title">제목 *</label>
        <input id="title" name="title" required defaultValue={product?.title ?? ""} className={ui.input} />
      </div>
      <div>
        <label className={ui.label} htmlFor="titleEn">제목(EN — 비우면 국문 폴백)</label>
        <input id="titleEn" name="titleEn" defaultValue={product?.titleEn ?? ""} className={ui.input} />
      </div>

      <div>
        <label className={ui.label} htmlFor="body">스펙표 HTML(원문 EUC-KR 디코딩 정화본 — 공개 렌더에서 재정화)</label>
        <textarea id="body" name="body" rows={16} defaultValue={product?.body ?? ""} className={ui.textarea} />
      </div>
      <div>
        <label className={ui.label} htmlFor="bodyEn">스펙표 HTML(EN)</label>
        <textarea id="bodyEn" name="bodyEn" rows={6} defaultValue={product?.bodyEn ?? ""} className={ui.textarea} />
      </div>

      <label className="flex items-center gap-2 text-[13px] font-semibold text-ink-dim">
        <input type="checkbox" name="published" defaultChecked={product?.published ?? true} className="h-4 w-4" />
        공개
      </label>

      <button type="submit" className={ui.btn}>저장</button>
    </form>
  );
}
