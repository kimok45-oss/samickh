"use server";

// 어드민 CRUD 서버 액션 (samickh) — **모든 변형 액션 첫 줄 await requireAdmin()** (BUILD-CONTRACT §보안).
// 파일 업로드가 필요한 변형(게시글 첨부·제품/계열 이미지·견적 접수)은 서버액션 bodySizeLimit(1MB)
// 때문에 /api/admin/* 라우트 핸들러로 분리되어 있다(그쪽도 requireAdmin).
//
// 주요 변형은 logAudit로 AuditLog에 기록한다.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/auth";
import { resolvePublicUploadPath, resolveVarPath, removeStoredFile } from "@/lib/uploads";
import { isBoardKey, type BoardKey } from "@/lib/board";

/* ── 공통 파서 ────────────────────────────────────────────────────────── */

function str(fd: FormData, key: string, max = 500): string {
  return String(fd.get(key) ?? "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim().slice(0, max);
}
function longStr(fd: FormData, key: string, max = 200000): string {
  return String(fd.get(key) ?? "").replace(/\x00/g, "").slice(0, max);
}
function intOf(fd: FormData, key: string): number | null {
  // 부재(신규 등록 폼엔 id 필드 없음)·빈문자열은 null로. Number(null)===0 함정 방지:
  // 0을 반환하면 저장 액션이 create가 아닌 update(id:0) 분기로 빠져 신규 등록이 전부 실패한다.
  const raw = fd.get(key);
  if (raw === null || (typeof raw === "string" && raw.trim() === "")) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}
/** datetime-local("YYYY-MM-DDTHH:mm") → KST 해석 Date. 불량이면 null. */
function kstDate(fd: FormData, key: string): Date | null {
  const v = str(fd, key, 30);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const d = new Date(`${v}:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 공개면 재검증 — 게시판/콘텐츠 변경 시 관련 경로 일괄 */
function revalidatePublic() {
  for (const p of [
    "/",
    "/support/resources",
    "/support/cad",
    "/support/product-info",
    "/support/faq",
    "/news/notice",
    "/news/industry",
    "/products",
    "/products/order-guide",
    "/business",
    "/company/history",
    "/company/clients",
    "/company/greeting",
    "/company/organization",
    "/company/location",
  ])
    revalidatePath(p);
}

/* ── ① 게시판(Post) — 텍스트 필드. 첨부는 /api/admin/attachments ─────── */

export async function savePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const boardRaw = str(formData, "board", 20);
  const board: BoardKey = isBoardKey(boardRaw) ? boardRaw : "notice";
  const title = str(formData, "title", 300);
  if (!title) redirect(`/admin/posts?board=${board}&err=invalid`);

  let slug = str(formData, "slug", 100).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = `${board}-a${Date.now().toString(36)}`;

  const data = {
    board,
    slug,
    title,
    titleEn: str(formData, "titleEn", 300) || null,
    body: longStr(formData, "body"),
    bodyEn: longStr(formData, "bodyEn") || null,
    origDate: kstDate(formData, "origDate") ?? new Date(),
    published: formData.get("published") !== null,
  };

  let postId = id;
  try {
    if (id != null) {
      await prisma.post.update({ where: { id }, data });
    } else {
      const created = await prisma.post.create({ data });
      postId = created.id;
    }
  } catch {
    // slug 중복(P2002) 등 — 목록으로 에러 반환
    redirect(`/admin/posts?board=${board}&err=save`);
  }

  await logAudit(id != null ? "update" : "create", "Post", postId, `${board}/${slug} ${title}`);
  revalidatePublic();
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${postId}?board=${board}&saved=1`);
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const post = await prisma.post.findUnique({ where: { id }, include: { attachments: true } });
  if (!post) return;
  // 관리자 업로드분(/uploads/attach/admin/...)만 디스크 삭제 — 원본 회수분은 보존
  for (const a of post.attachments) {
    if (a.storeName.startsWith("/uploads/attach/admin/")) {
      await removeStoredFile(resolvePublicUploadPath(a.storeName));
    }
  }
  await prisma.post.delete({ where: { id } }); // Attachment는 cascade
  await logAudit("delete", "Post", id, `${post.board}/${post.slug} ${post.title}`);
  revalidatePublic();
  revalidatePath("/admin/posts");
  redirect(`/admin/posts?board=${post.board}`);
}

export async function togglePostPublished(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  await prisma.post.update({ where: { id }, data: { published: !post.published } });
  await logAudit("toggle-published", "Post", id, `${post.board}/${post.slug} → ${!post.published}`);
  revalidatePublic();
  revalidatePath("/admin/posts");
}

/** 첨부 삭제 — 관리자 업로드분만 디스크에서도 제거(원본 회수분은 DB 행만 제거 방지 위해 유지). */
export async function deleteAttachment(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return;
  if (att.storeName.startsWith("/uploads/attach/admin/")) {
    await removeStoredFile(resolvePublicUploadPath(att.storeName));
  }
  await prisma.attachment.delete({ where: { id } });
  await logAudit("delete", "Attachment", id, att.fileName);
  revalidatePublic();
  revalidatePath(`/admin/posts/${att.postId}`);
}

/* ── ② 문의/견적(Inquiry) — 삭제 = PII 파기(첨부 실파일 포함) ────────── */

export async function deleteInquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const inq = await prisma.inquiry.findUnique({ where: { id } });
  if (!inq) return;
  if (inq.storeName) {
    await removeStoredFile(resolveVarPath(inq.storeName)); // 견적 첨부(PII 가능) 실파일 파기
  }
  await prisma.inquiry.delete({ where: { id } });
  await logAudit("delete", "Inquiry", id, `${inq.kind} (PII 파기)`);
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries");
}

/* ── ③ SiteContent — group별 폼(value_<key> / valueEn_<key>) ─────────── */

export async function saveSiteContent(formData: FormData): Promise<void> {
  await requireAdmin();
  const group = str(formData, "group", 50);
  const rows = await prisma.siteContent.findMany({ where: { group } });
  for (const row of rows) {
    const v = formData.get(`value_${row.key}`);
    const vEn = formData.get(`valueEn_${row.key}`);
    if (v === null && vEn === null) continue;
    await prisma.siteContent.update({
      where: { key: row.key },
      data: {
        ...(v !== null ? { value: String(v).slice(0, 20000) } : {}),
        ...(vEn !== null ? { valueEn: String(vEn).slice(0, 20000) || null } : {}),
      },
    });
  }
  await logAudit("update", "SiteContent", group, `그룹 ${group} 저장`);
  revalidatePublic();
  revalidatePath("/admin/site-content");
}

/* ── ⑤ 연혁(History) ─────────────────────────────────────────────────── */

export async function saveHistory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const year = intOf(formData, "year");
  const text = str(formData, "text", 500);
  if (year == null || year < 1900 || year > 2100 || !text) return;
  const data = {
    year,
    text,
    textEn: str(formData, "textEn", 500) || null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
  };
  if (id != null) await prisma.history.update({ where: { id }, data });
  else await prisma.history.create({ data });
  await logAudit(id != null ? "update" : "create", "History", id, `${year} ${text.slice(0, 50)}`);
  revalidatePublic();
  revalidatePath("/admin/history");
}

export async function deleteHistory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  await prisma.history.delete({ where: { id } }).catch(() => {});
  await logAudit("delete", "History", id);
  revalidatePublic();
  revalidatePath("/admin/history");
}

/* ── ⑦ 제품(Product) — 이미지는 /api/admin/product-image ─────────────── */

export async function saveProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const title = str(formData, "title", 300);
  if (!title) redirect(`/admin/products?err=invalid`);
  let slug = str(formData, "slug", 100).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = `p-a${Date.now().toString(36)}`;
  const category = intOf(formData, "category") ?? 1;
  const data = {
    slug,
    category: [1, 2, 3].includes(category) ? category : 1,
    title,
    titleEn: str(formData, "titleEn", 300) || null,
    body: longStr(formData, "body"),
    bodyEn: longStr(formData, "bodyEn") || null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
    published: formData.get("published") !== null,
  };
  let productId = id;
  try {
    if (id != null) await prisma.product.update({ where: { id }, data });
    else productId = (await prisma.product.create({ data })).id;
  } catch {
    redirect(`/admin/products?err=save`);
  }
  await logAudit(id != null ? "update" : "create", "Product", productId, `${slug} ${title.slice(0, 50)}`);
  revalidatePublic();
  revalidatePath("/admin/products");
  redirect(`/admin/products/${productId}?saved=1`);
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const prod = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!prod) return;
  for (const img of prod.images) {
    if (img.path.startsWith("/uploads/products/")) {
      await removeStoredFile(resolvePublicUploadPath(img.path));
    }
  }
  await prisma.product.delete({ where: { id } });
  await logAudit("delete", "Product", id, `${prod.slug} ${prod.title.slice(0, 50)}`);
  revalidatePublic();
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProductImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const img = await prisma.productImage.findUnique({ where: { id } });
  if (!img) return;
  if (img.path.startsWith("/uploads/products/")) {
    await removeStoredFile(resolvePublicUploadPath(img.path));
  }
  await prisma.productImage.delete({ where: { id } });
  await logAudit("delete", "ProductImage", id, img.path);
  revalidatePublic();
  revalidatePath(`/admin/products/${img.productId}`);
}

/* ── ⑧ 사업분야 계열(Series) — 이미지는 /api/admin/series-image ──────── */

export async function saveSeries(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const name = str(formData, "name", 200);
  if (!name) redirect(`/admin/series?err=invalid`);
  let slug = str(formData, "slug", 100).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug) slug = `s-a${Date.now().toString(36)}`;
  const kindRaw = str(formData, "kind", 20);
  // features: 관리자 폼은 줄단위 입력 → JSON 배열 문자열로 저장(스키마 규약)
  const featureLines = longStr(formData, "features", 10000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const data = {
    slug,
    name,
    nameEn: str(formData, "nameEn", 200) || null,
    seriesCode: str(formData, "seriesCode", 100),
    kind: kindRaw === "pneumatic" ? "pneumatic" : "hydraulic",
    intro: longStr(formData, "intro", 20000),
    introEn: longStr(formData, "introEn", 20000) || null,
    specHtml: longStr(formData, "specHtml"),
    specHtmlEn: longStr(formData, "specHtmlEn") || null,
    features: featureLines.length ? JSON.stringify(featureLines) : null,
    featuresEn: null as string | null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
    published: formData.get("published") !== null,
  };
  const featuresEnLines = longStr(formData, "featuresEn", 10000)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  data.featuresEn = featuresEnLines.length ? JSON.stringify(featuresEnLines) : null;

  let seriesId = id;
  try {
    if (id != null) await prisma.series.update({ where: { id }, data });
    else seriesId = (await prisma.series.create({ data })).id;
  } catch {
    redirect(`/admin/series?err=save`);
  }
  await logAudit(id != null ? "update" : "create", "Series", seriesId, `${slug} ${name}`);
  revalidatePublic();
  revalidatePath("/admin/series");
  redirect(`/admin/series/${seriesId}?saved=1`);
}

export async function deleteSeries(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const s = await prisma.series.findUnique({ where: { id }, include: { images: true } });
  if (!s) return;
  for (const img of s.images) {
    if (img.path.startsWith("/uploads/series/")) {
      await removeStoredFile(resolvePublicUploadPath(img.path));
    }
  }
  await prisma.series.delete({ where: { id } });
  await logAudit("delete", "Series", id, `${s.slug} ${s.name}`);
  revalidatePublic();
  revalidatePath("/admin/series");
  redirect("/admin/series");
}

export async function deleteSeriesImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  const img = await prisma.seriesImage.findUnique({ where: { id } });
  if (!img) return;
  if (img.path.startsWith("/uploads/series/")) {
    await removeStoredFile(resolvePublicUploadPath(img.path));
  }
  await prisma.seriesImage.delete({ where: { id } });
  await logAudit("delete", "SeriesImage", id, img.path);
  revalidatePublic();
  revalidatePath(`/admin/series/${img.seriesId}`);
}

/* ── ⑧b 거래처(Client) ───────────────────────────────────────────────── */

const CLIENT_GROUPS = new Set(["posco", "steel-plant", "machine", "construction"]);

export async function saveClient(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const name = str(formData, "name", 100);
  const group = str(formData, "group", 30);
  if (!name || !CLIENT_GROUPS.has(group)) return;
  const data = {
    group,
    name,
    nameEn: str(formData, "nameEn", 100) || null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
  };
  if (id != null) await prisma.client.update({ where: { id }, data });
  else await prisma.client.create({ data });
  await logAudit(id != null ? "update" : "create", "Client", id, `${group}/${name}`);
  revalidatePublic();
  revalidatePath("/admin/clients");
}

export async function deleteClient(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  await prisma.client.delete({ where: { id } }).catch(() => {});
  await logAudit("delete", "Client", id);
  revalidatePublic();
  revalidatePath("/admin/clients");
}

/* ── ⑨ 주문사양(BoreRod·Mounting) 표 편집 ────────────────────────────── */

export async function saveBoreRod(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const code = str(formData, "code", 10);
  const bore = Number(formData.get("bore"));
  const rodB = Number(formData.get("rodB"));
  const rodC = Number(formData.get("rodC"));
  if (!code || !Number.isFinite(bore) || !Number.isFinite(rodB) || !Number.isFinite(rodC)) return;
  const data = { code, bore, rodB, rodC, sortOrder: intOf(formData, "sortOrder") ?? 0 };
  try {
    if (id != null) await prisma.boreRod.update({ where: { id }, data });
    else await prisma.boreRod.create({ data });
  } catch {
    return; // code 중복 등
  }
  await logAudit(id != null ? "update" : "create", "BoreRod", id, code);
  revalidatePublic();
  revalidatePath("/admin/order-specs");
}

export async function deleteBoreRod(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  await prisma.boreRod.delete({ where: { id } }).catch(() => {});
  await logAudit("delete", "BoreRod", id);
  revalidatePublic();
  revalidatePath("/admin/order-specs");
}

export async function saveMounting(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const code = str(formData, "code", 10).toUpperCase();
  const name = str(formData, "name", 100);
  if (!code || !name) return;
  const data = {
    code,
    name,
    nameEn: str(formData, "nameEn", 100) || null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
  };
  try {
    if (id != null) await prisma.mounting.update({ where: { id }, data });
    else await prisma.mounting.create({ data });
  } catch {
    return;
  }
  await logAudit(id != null ? "update" : "create", "Mounting", id, code);
  revalidatePublic();
  revalidatePath("/admin/order-specs");
}

export async function deleteMounting(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  await prisma.mounting.delete({ where: { id } }).catch(() => {});
  await logAudit("delete", "Mounting", id);
  revalidatePublic();
  revalidatePath("/admin/order-specs");
}

/* ── ⑫ FAQ ───────────────────────────────────────────────────────────── */

export async function saveFaq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  const question = str(formData, "question", 500);
  const answer = longStr(formData, "answer", 10000);
  if (!question || !answer.trim()) return;
  const data = {
    question,
    questionEn: str(formData, "questionEn", 500) || null,
    answer,
    answerEn: longStr(formData, "answerEn", 10000).trim() || null,
    sortOrder: intOf(formData, "sortOrder") ?? 0,
    published: formData.get("published") !== null,
  };
  if (id != null) await prisma.faq.update({ where: { id }, data });
  else await prisma.faq.create({ data });
  await logAudit(id != null ? "update" : "create", "Faq", id, question.slice(0, 50));
  revalidatePublic();
  revalidatePath("/admin/faqs");
}

export async function deleteFaq(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = intOf(formData, "id");
  if (id == null) return;
  await prisma.faq.delete({ where: { id } }).catch(() => {});
  await logAudit("delete", "Faq", id);
  revalidatePublic();
  revalidatePath("/admin/faqs");
}

/* ── ⑫b 비밀번호 해시 생성(/admin/password) — 출력만, env 교체는 수동 ── */

export type HashGenState = { hash: string; error: string };

export async function generatePasswordHash(
  _prev: HashGenState,
  formData: FormData,
): Promise<HashGenState> {
  await requireAdmin();
  const pw = String(formData.get("password") ?? "");
  if (pw.length < 8) {
    return { hash: "", error: "8자 이상으로 입력해 주세요." };
  }
  if (/\$/.test(pw)) {
    // .env에서 $는 변수 확장으로 절단됨(BUILD-CONTRACT) — 해시엔 없지만 비번 자체도 피하는 게 안전
    return { hash: "", error: "비밀번호에 $ 문자는 사용하지 마세요(.env 절단 함정)." };
  }
  await logAudit("generate-hash", "Admin", null, "비밀번호 해시 생성(값 미기록)");
  return { hash: hashPassword(pw), error: "" };
}
