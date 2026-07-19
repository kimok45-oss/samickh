// POST /api/admin/product-image — 제품 이미지 업로드(관리자 전용, multipart 폼 타깃).
// public/uploads/products/<productId>/<난수>.<ext> (이미지 확장자만 + 매직바이트)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import { logAudit } from "@/lib/audit";
import { storePublicFile, IMAGE_EXT } from "@/lib/uploads";

function back(req: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, req.url), 303);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return back(req, "/admin/login");
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const productId = Number(fd.get("productId"));
  if (!Number.isInteger(productId)) return new NextResponse("Bad Request", { status: 400 });
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return new NextResponse("Not Found", { status: 404 });

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return back(req, `/admin/products/${productId}?err=nofile`);
  }
  const { stored, err } = await storePublicFile(file, `products/${productId}`, IMAGE_EXT);
  if (err) return back(req, `/admin/products/${productId}?err=${err}`);

  const alt = String(fd.get("alt") ?? "").trim().slice(0, 200) || null;
  const sortOrder = Number.isInteger(Number(fd.get("sortOrder"))) ? Number(fd.get("sortOrder")) : 0;
  await prisma.productImage.create({
    data: { productId, path: stored!.storeName, alt, sortOrder },
  });
  await logAudit("upload", "ProductImage", productId, stored!.storeName);
  return back(req, `/admin/products/${productId}?imgsaved=1`);
}
