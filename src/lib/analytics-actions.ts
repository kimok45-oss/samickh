"use server";

// 방문 분석 관리 액션 — 반드시 requireAdmin 가드(공개 POST 우회 방지).
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";

/** 방문 데이터 전체 삭제(초기화). 대시보드의 2단(details) 확인 뒤에만 노출된다. */
export async function clearAllVisits(): Promise<void> {
  await requireAdmin();
  await prisma.pageView.deleteMany({});
  revalidatePath("/admin");
}
