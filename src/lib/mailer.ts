// lib/mailer.ts — 문의/견적 접수 SMTP 알림 (선택 기능)
//
// SMTP env(SMTP_HOST·SMTP_PORT·SMTP_USER·SMTP_PASS·INQUIRY_NOTIFY_TO) 미설정이면
// 아무 동작도 하지 않고 조용히 스킵한다(에러 없음 — 접수 자체는 DB에 이미 저장됨).
// ⚠ "use server" 파일이 아니다 — 공개 액션으로 노출되지 않도록 일반 모듈로 둔다.

type MailInput = {
  subject: string;
  /** 평문 본문(HTML 아님 — 인젝션 여지 제거) */
  text: string;
};

export async function sendNotifyMail({ subject, text }: MailInput): Promise<void> {
  const host = process.env.SMTP_HOST;
  const to = process.env.INQUIRY_NOTIFY_TO;
  if (!host || !to) return; // 미설정 → 무동작 스킵

  try {
    const { default: nodemailer } = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT ?? "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || user || `no-reply@${host}`,
      to,
      subject,
      text,
    });
  } catch (e) {
    // 알림 실패가 접수 자체를 막으면 안 됨 — 로그만 남기고 계속
    console.error("[mailer] notify failed:", e instanceof Error ? e.message : e);
  }
}
