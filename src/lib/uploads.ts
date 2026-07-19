// lib/uploads.ts — 첨부 업로드 공통 모듈 (samickh 배선판)
//
// 저장 위치 2원칙(BUILD-CONTRACT §보안):
//  - 게시판 공개자료: public/uploads/attach/... (직링크 허용 — 이미 원본 회수분이 여기 있음)
//  - 견적요청 첨부(PII 가능): var/uploads/... (public 밖) + 관리자 인증 다운로드 라우트로만 접근
//
// 검증 3중: 확장자 화이트리스트(pdf zip jpg jpeg png gif dwg dwf) + 매직바이트 + 난수 파일명.

import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

export const MAX_FILE_MB = 20;

/** 게시판 공개 첨부 루트(직링크 /uploads/...) */
export const PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
/** 견적 첨부 루트 — public 밖(무인증 직링크 불가) */
export const VAR_UPLOAD_ROOT = path.join(process.cwd(), "var", "uploads");

/** 허용 확장자(원문 게시판 자료 유형: 카탈로그 PDF·CAD zip/dwg/dwf·사진) */
export const ALLOWED_EXT = new Set(["pdf", "zip", "jpg", "jpeg", "png", "gif", "dwg", "dwf"]);
/** 이미지 전용(제품/계열 이미지 업로드) */
export const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif"]);

export function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

/** 표시용 파일명 정리 — 경로분리자·제어문자 제거, NFC 정규화(한글 보존) */
export function safeFileName(name: string): string {
  const cleaned = name
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, "_")
    .replace(/^\.+/, "_")
    .trim()
    .slice(0, 120);
  return cleaned || "file";
}

/** 매직바이트 검증 — 확장자와 실제 헤더가 일치해야 통과. */
export function magicBytesOk(ext: string, buf: Buffer): boolean {
  if (buf.length < 4) return false;
  const head4 = buf.subarray(0, 4).toString("latin1");
  switch (ext) {
    case "pdf":
      return head4 === "%PDF";
    case "zip":
      return head4.startsWith("PK\x03\x04") || head4.startsWith("PK\x05\x06") || head4.startsWith("PK\x07\x08");
    case "jpg":
    case "jpeg":
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "png":
      return buf[0] === 0x89 && head4.slice(1) === "PNG";
    case "gif":
      return head4 === "GIF8";
    case "dwg":
      // AutoCAD DWG: 버전 시그니처 "AC10xx"(예: AC1015, AC1032)
      return head4 === "AC10";
    case "dwf":
      // DWF 클래식 "(DWF V..." / DWFx는 zip 컨테이너(PK)
      return head4 === "(DWF" || head4.startsWith("PK\x03\x04");
    default:
      return false;
  }
}

export type StoredFile = {
  /** 표시용 원본 파일명 */
  fileName: string;
  /** 저장 파일명(난수) — public이면 "/uploads/..." 경로, var면 상대 저장명 */
  storeName: string;
  mime: string;
  size: number;
};

export type UploadErr = "" | "toobig" | "ext" | "magic";

async function validate(
  file: File,
  allow: Set<string>,
): Promise<{ ext: string; buf: Buffer; err: UploadErr }> {
  const ext = extOf(file.name);
  if (!allow.has(ext)) return { ext, buf: Buffer.alloc(0), err: "ext" };
  if (file.size > MAX_FILE_MB * 1024 * 1024) return { ext, buf: Buffer.alloc(0), err: "toobig" };
  const buf = Buffer.from(await file.arrayBuffer());
  if (!magicBytesOk(ext, buf)) return { ext, buf: Buffer.alloc(0), err: "magic" };
  return { ext, buf, err: "" };
}

/**
 * 게시판/이미지 등 공개 첨부 저장 — public/uploads/<subdir>/<난수>.<ext>
 * 반환 storeName은 "/uploads/<subdir>/<난수>.<ext>" (직링크 경로).
 */
export async function storePublicFile(
  file: File,
  subdir: string,
  allow: Set<string> = ALLOWED_EXT,
): Promise<{ stored: StoredFile | null; err: UploadErr }> {
  const { ext, buf, err } = await validate(file, allow);
  if (err) return { stored: null, err };
  const rand = randomBytes(8).toString("hex");
  const dir = path.join(PUBLIC_UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  const fname = `${rand}.${ext}`;
  await writeFile(path.join(dir, fname), buf);
  return {
    stored: {
      fileName: safeFileName(file.name),
      storeName: `/uploads/${subdir.replace(/\\/g, "/")}/${fname}`,
      mime: file.type || mimeOf(ext),
      size: buf.length,
    },
    err: "",
  };
}

/**
 * 견적요청 첨부 저장 — var/uploads/quote/<난수>.<ext> (public 밖).
 * 반환 storeName은 "quote/<난수>.<ext>" — 다운로드는 관리자 인증 라우트에서 resolveVarPath로만.
 */
export async function storeQuoteFile(
  file: File,
): Promise<{ stored: StoredFile | null; err: UploadErr }> {
  const { ext, buf, err } = await validate(file, ALLOWED_EXT);
  if (err) return { stored: null, err };
  const rand = randomBytes(12).toString("hex");
  const dir = path.join(VAR_UPLOAD_ROOT, "quote");
  await mkdir(dir, { recursive: true });
  const fname = `${rand}.${ext}`;
  await writeFile(path.join(dir, fname), buf);
  return {
    stored: {
      fileName: safeFileName(file.name),
      storeName: `quote/${fname}`,
      mime: file.type || mimeOf(ext),
      size: buf.length,
    },
    err: "",
  };
}

/** var/uploads 안으로만 경로 확정(../ 탐색 차단). 실패 시 null. */
export function resolveVarPath(storeName: string): string | null {
  if (!storeName || storeName.includes("..")) return null;
  const abs = path.resolve(VAR_UPLOAD_ROOT, storeName);
  if (abs !== VAR_UPLOAD_ROOT && !abs.startsWith(VAR_UPLOAD_ROOT + path.sep)) return null;
  return abs;
}

/** public/uploads 안으로만 경로 확정(삭제용). "/uploads/..." 형태만 허용. */
export function resolvePublicUploadPath(storeName: string): string | null {
  if (!storeName.startsWith("/uploads/")) return null;
  const abs = path.resolve(process.cwd(), "public", storeName.replace(/^\//, ""));
  if (abs !== PUBLIC_UPLOAD_ROOT && !abs.startsWith(PUBLIC_UPLOAD_ROOT + path.sep)) return null;
  return abs;
}

/** 디스크 파일 삭제(있으면). 실패는 조용히 무시. */
export async function removeStoredFile(abs: string | null): Promise<void> {
  if (abs) await unlink(abs).catch(() => {});
}

export function mimeOf(ext: string): string {
  switch (ext) {
    case "pdf": return "application/pdf";
    case "zip": return "application/zip";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "gif": return "image/gif";
    case "dwg": return "application/acad";
    case "dwf": return "model/vnd.dwf";
    default: return "application/octet-stream";
  }
}
