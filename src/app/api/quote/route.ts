// POST /api/quote — 견적요청 접수(공개, multipart).
// 서버액션 bodySizeLimit(1MB) 때문에 파일첨부가 있는 견적은 라우트 핸들러로 처리한다.
// 방어: 허니팟 + IP rate-limit + 서버검증 + 확장자/매직바이트 검증 + var/uploads(공개 밖) 저장 + IP 해시.
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { rateLimited } from "@/lib/auth";
import { ipFrom } from "@/lib/analytics";
import { storeQuoteFile, MAX_FILE_MB } from "@/lib/uploads";
import { sendNotifyMail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  const isEn = req.cookies.get("lang")?.value === "en";
  const msg = (ko: string, en: string) => (isEn ? en : ko);
  const json = (ok: boolean, message: string, status = 200) =>
    NextResponse.json({ ok, message }, { status });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return json(false, msg("잘못된 요청입니다.", "Invalid request."), 400);
  }

  // 1) 허니팟 — 봇이 채우면 저장 없이 성공처럼 응답
  if (clean(fd.get("website"), 100)) {
    return json(true, msg("견적요청이 정상적으로 접수되었습니다.", "Your quote request has been received."));
  }

  // 2) rate-limit — 같은 IP 10분 5회
  const ip = ipFrom(req.headers);
  if (rateLimited(`quote:${ip}`, 5, 10 * 60 * 1000)) {
    return json(false, msg("요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.", "Too many requests. Please try again later."), 429);
  }

  // 3) 필드(원문 estimate.php 구성: 회사명·성명·전화·휴대폰·주소·이메일·내용·파일첨부)
  const company = clean(fd.get("company"), 100);
  const name = clean(fd.get("name"), 100);
  const phone = clean(fd.get("phone"), 50);
  const mobile = clean(fd.get("mobile"), 50);
  const address = clean(fd.get("address"), 300);
  const email = clean(fd.get("email"), 200);
  const message = clean(fd.get("message"), 10000);
  const agreed = fd.get("agreed") === "on";

  if (!name || !message) {
    return json(false, msg("성명과 내용을 입력해 주세요.", "Please enter your name and message."), 400);
  }
  if (!phone && !mobile && !email) {
    return json(false, msg("전화·휴대폰·이메일 중 하나 이상을 입력해 주세요.", "Please provide a phone, mobile, or email."), 400);
  }
  if (email && !EMAIL_RE.test(email)) {
    return json(false, msg("올바른 이메일 형식을 입력해 주세요.", "Please enter a valid email address."), 400);
  }
  if (!agreed) {
    return json(false, msg("개인정보 수집·이용에 동의해 주세요.", "Please agree to the collection and use of personal information."), 400);
  }

  // 4) 파일첨부(선택) — 화이트리스트+매직바이트, var/uploads(공개 밖)
  let fileName: string | null = null;
  let storeName: string | null = null;
  const file = fd.get("file");
  if (file instanceof File && file.size > 0) {
    const { stored, err } = await storeQuoteFile(file);
    if (err === "toobig") {
      return json(false, msg(`첨부는 ${MAX_FILE_MB}MB 이하만 가능합니다.`, `Attachment must be under ${MAX_FILE_MB}MB.`), 400);
    }
    if (err) {
      return json(false, msg("허용되지 않는 파일 형식입니다. (pdf·zip·jpg·png·gif·dwg·dwf)", "File type not allowed. (pdf, zip, jpg, png, gif, dwg, dwf)"), 400);
    }
    fileName = stored!.fileName;
    storeName = stored!.storeName;
  }

  try {
    await prisma.inquiry.create({
      data: {
        kind: "quote",
        company: company || null,
        name,
        phone: phone || null,
        mobile: mobile || null,
        address: address || null,
        email: email || null,
        message,
        fileName,
        storeName,
        ip: createHash("sha256").update(`samickh:${ip}`).digest("hex").slice(0, 32),
      },
    });
  } catch (e) {
    console.error("quote create failed", e);
    return json(false, msg("일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "A temporary error occurred. Please try again later."), 500);
  }

  await sendNotifyMail({
    subject: `[삼익유공압] 견적요청 접수 — ${name}${company ? ` (${company})` : ""}`,
    text: `회사명: ${company || "-"}\n성명: ${name}\n전화: ${phone || "-"}\n휴대폰: ${mobile || "-"}\n주소: ${address || "-"}\n이메일: ${email || "-"}\n첨부: ${fileName || "-"}\n\n${message}`,
  });

  return json(true, msg("견적요청이 정상적으로 접수되었습니다. 확인 후 연락드리겠습니다.", "Your quote request has been received. We will contact you shortly."));
}
