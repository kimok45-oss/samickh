// lib/mailer.ts — 문의/견적 접수 SMTP 알림 (선택 기능)
//
// SMTP env(SMTP_HOST·SMTP_PORT·SMTP_USER·SMTP_PASS·INQUIRY_NOTIFY_TO) 미설정이면
// 아무 동작도 하지 않고 조용히 스킵한다(에러 없음 — 접수 자체는 DB에 이미 저장됨).
// ⚠ "use server" 파일이 아니다 — 공개 액션으로 노출되지 않도록 일반 모듈로 둔다.
//
// 2026-10-22 오너 '나머지 다 진행'(1-3-12 · 1-1-2): 이미 있던 알림을 점검·보강했다(형제 리포 labscience·hanilstee 판과 같은 규칙).
//  · nodemailer 9 → 10(1-1-2). 10.0.0 의 큰 변경은 "Node 20 이상 · TypeScript ESM/CJS 빌드" 뿐이라 createTransport·sendMail 은 그대로다.
//  · 설정값은 부를 때마다 읽는다(모듈을 처음 불러온 순간의 값에 묶이지 않게 — 시험 스크립트도 이 덕에 돈다).
//  · SMTP 연결·인사·소켓 시간 한도 10초 — nodemailer 기본값(연결 2분·소켓 10분)이면 응답 없는 서버에
//    방문자의 '보내기'가 오래 붙잡힌다(접수 응답이 메일 발송을 기다린다).
//  · 제목에서 개행을 없앤다 — 방문자가 적은 성명·회사명이 들어가는 자리라 헤더 끼워 넣기를 막는다.
//  · 받는 사람은 쉼표로 여러 명. 보내는 사람: SMTP_FROM → SMTP_USER → 받는 사람 첫 주소
//    (예전 기본값 no-reply@<SMTP 서버 이름>은 없는 주소라 거절될 수 있었다).
//  · SMTP_USER·SMTP_PASS 가 둘 다 있을 때만 로그인한다(USER 만 있으면 빈 비밀번호로 로그인을 시도하게 된다).
//  · 실패하면 서버 로그에 오류 메시지만 남긴다 — 이름·연락처·내용(개인정보)은 로그에 쓰지 않는다.
//  · 시험 모드: SMTP_HOST=json 이면 실제로 보내지 않고 nodemailer jsonTransport 로 만든 메일을 돌려주기만 한다
//    (운영 .env 에는 쓰지 않는다 — 시험 스크립트 전용).
// [확인필요] 회사 메일 서버(또는 발송 서비스) 정보 — 값이 오면 .env 만 채우면 된다(.env.example 참고).

type MailInput = {
  subject: string;
  /** 평문 본문(HTML 아님 — 인젝션 여지 제거) */
  text: string;
};

export type MailResult = { result: "sent" | "skipped" | "failed"; preview?: string };

const MAIL_TIMEOUT_MS = 10_000;

/** 헤더에 들어갈 값에서 개행을 없앤다(SMTP 헤더 끼워 넣기 차단). */
export function headerSafe(s: string, max = 200): string {
  return s.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

/** SMTP_HOST · INQUIRY_NOTIFY_TO 가 둘 다 있어야 켜진다. */
export function mailerConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.INQUIRY_NOTIFY_TO?.trim());
}

/** 접수 알림 발송. 미설정이면 "skipped", 실패하면 "failed" — 어느 쪽도 throw 하지 않는다(접수 자체를 막으면 안 됨). */
export async function sendNotifyMail({ subject, text }: MailInput): Promise<MailResult> {
  if (!mailerConfigured()) return { result: "skipped" }; // 미설정 → 무동작 스킵

  const host = process.env.SMTP_HOST!.trim();
  const to = process.env
    .INQUIRY_NOTIFY_TO!.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const port = Number(process.env.SMTP_PORT ?? "587") || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  const from = (process.env.SMTP_FROM || user || to[0] || "").trim();
  if (!from || to.length === 0) return { result: "skipped" };

  try {
    const { default: nodemailer } = await import("nodemailer");
    const transporter =
      host === "json"
        ? nodemailer.createTransport({ jsonTransport: true })
        : nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // 465=암호화 연결, 그 외(587)는 STARTTLS
            ...(user && pass ? { auth: { user, pass } } : {}),
            connectionTimeout: MAIL_TIMEOUT_MS,
            greetingTimeout: MAIL_TIMEOUT_MS,
            socketTimeout: MAIL_TIMEOUT_MS,
          });
    const info = await transporter.sendMail({
      from,
      to,
      subject: headerSafe(subject),
      text,
    });
    // jsonTransport 일 때만 info.message 가 메일 JSON 문자열 — 시험 스크립트가 내용을 확인하는 데 쓴다.
    const preview = host === "json" && typeof info.message === "string" ? info.message : undefined;
    return { result: "sent", preview };
  } catch (e) {
    // 알림 실패가 접수 자체를 막으면 안 됨 — 오류 메시지만 남기고 계속(개인정보는 로그에 쓰지 않는다)
    console.error("[mailer] 접수 알림 발송 실패(접수는 정상 처리됨):", e instanceof Error ? e.message : "unknown error");
    return { result: "failed" };
  }
}
