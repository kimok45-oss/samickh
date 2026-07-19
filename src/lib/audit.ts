// lib/audit.ts — 감사 로그 기록 헬퍼 (관리자 변형 액션/라우트 공용)
// "use server" 파일이 아니다 — 공개 액션으로 노출되지 않는 일반 모듈.
import { prisma } from "@/lib/db";

/** 주요 변형 작업을 AuditLog에 기록. 실패해도 본 작업을 막지 않는다. */
export async function logAudit(
  action: string,
  entity: string,
  entityId?: string | number | null,
  detail?: string,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId: entityId == null ? null : String(entityId),
        detail: detail?.slice(0, 500) ?? null,
      },
    });
  } catch {
    // 감사 기록 실패는 무시(본 작업 우선)
  }
}
