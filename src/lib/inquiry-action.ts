"use server";

// 온라인문의 서버 액션 (samickh 배선판) — useActionState 용.
// 허니팟 + 서버검증 + IP rate-limit(TRUSTED_PROXY_HOPS) + 정화(평문 저장) + IP 해시 저장 + SMTP 알림.
//
// ⚠ 견적요청(파일첨부 포함)은 서버액션 bodySizeLimit(기본 1MB) 때문에 여기가 아니라
//    /api/quote 라우트 핸들러로 처리한다(next.config.ts 수정 금지 계약). 이 파일은 문의(inquiry) 전용.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { rateLimited } from "@/lib/auth";
import { sendNotifyMail } from "@/lib/mailer";
import { browserOf, osOf } from "@/lib/analytics";

export type InquiryState = { ok: boolean; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** x-forwarded-for에서 신뢰 홉 수(TRUSTED_PROXY_HOPS, 기본 1)만큼 뒤에서 세어 클라 IP 추출.
 *  내부 헬퍼 — "use server" 파일에서 export하면 불필요한 공개 액션으로 등록되므로 비-export. */
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) {
    const list = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const hops = Math.max(1, Math.trunc(Number(process.env.TRUSTED_PROXY_HOPS ?? "1")) || 1);
    return list[Math.max(0, list.length - hops)] ?? list[0] ?? "unknown";
  }
  return h.get("x-real-ip")?.trim() || "unknown";
}

function ipHash(ip: string): string {
  return createHash("sha256").update(`samickh:${ip}`).digest("hex").slice(0, 32);
}

/** 제어문자 제거 + 트림(태그는 평문 그대로 저장하고 렌더 시 이스케이프됨) */
function clean(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim().slice(0, max);
}

/** 온라인문의(원문 폼 미구성 → 표준 문의폼: 성명·연락처·이메일·내용) */
export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const isEn = String(formData.get("lang") ?? "") === "en";
  const msg = (ko: string, en: string) => (isEn ? en : ko);

  // 1) 허니팟 — 숨겨진 "website" 필드를 봇이 채우면 저장 없이 성공처럼 응답
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: msg("문의가 정상적으로 접수되었습니다.", "Your inquiry has been received.") };
  }

  // 2) rate-limit — 같은 IP 10분 5회
  const ip = await clientIp();
  if (rateLimited(`inquiry:${ip}`, 5, 10 * 60 * 1000)) {
    return { ok: false, message: msg("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", "Too many requests. Please try again later.") };
  }

  const name = clean(formData.get("name"), 100);
  const phone = clean(formData.get("phone"), 50);
  const email = clean(formData.get("email"), 200);
  const message = clean(formData.get("message"), 5000);
  const agreed = formData.get("agreed") === "on";

  if (!name || !message) {
    return { ok: false, message: msg("성명과 내용을 입력해 주세요.", "Please enter your name and message.") };
  }
  if (!phone && !email) {
    return { ok: false, message: msg("연락처 또는 이메일을 입력해 주세요.", "Please enter a phone number or email.") };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, message: msg("올바른 이메일 형식을 입력해 주세요.", "Please enter a valid email address.") };
  }
  if (!agreed) {
    return { ok: false, message: msg("개인정보 수집·이용에 동의해 주세요.", "Please agree to the collection and use of personal information.") };
  }

  try {
    await prisma.inquiry.create({
      data: {
        kind: "inquiry",
        name,
        phone: phone || null,
        email: email || null,
        message,
        ip: ipHash(ip),
      },
    });
    revalidatePath("/admin/inquiries");

    // 전환 기록 — 방문자 분석에 "문의 제출" 1건(kind="event"). 실패해도 접수는 성공 처리.
    try {
      const ua = (await headers()).get("user-agent") ?? "";
      await prisma.pageView.create({
        data: {
          path: "/support/inquiry",
          kind: "event",
          eventName: "inquiry",
          browser: browserOf(ua),
          os: osOf(ua),
        },
      });
    } catch {
      /* 집계 실패는 무시 */
    }

    await sendNotifyMail({
      subject: `[삼익유공압] 온라인문의 접수 — ${name}`,
      text: `성명: ${name}\n연락처: ${phone || "-"}\n이메일: ${email || "-"}\n\n${message}`,
    });
    return {
      ok: true,
      message: msg(
        "문의가 정상적으로 접수되었습니다. 확인 후 연락드리겠습니다.",
        "Your inquiry has been received. We will contact you shortly.",
      ),
    };
  } catch (e) {
    console.error("inquiry create failed", e);
    return { ok: false, message: msg("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "A temporary error occurred. Please try again later.") };
  }
}
