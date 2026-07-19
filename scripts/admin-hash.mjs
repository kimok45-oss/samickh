#!/usr/bin/env node
// 관리자 비밀번호 scrypt 해시 생성기 — 사용법: node scripts/admin-hash.mjs <비밀번호>
// 출력 포맷: saltHex.hashHex (점 구분 — `$` 문자 금지: .env 변수확장 절단 함정 방지)
// 출력값을 .env 의 ADMIN_PASSWORD_HASH= 에 넣고 서버를 재시작하면 적용된다.
import { randomBytes, scryptSync } from "node:crypto";

const pw = process.argv[2];
if (!pw) {
  console.error("사용법: node scripts/admin-hash.mjs <비밀번호>");
  process.exit(1);
}
if (pw.length < 8) {
  console.error("비밀번호는 8자 이상으로 하세요.");
  process.exit(1);
}
if (pw.includes("$")) {
  console.error("비밀번호에 $ 문자는 피하세요(.env 변수확장 절단 함정).");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pw, salt, 64).toString("hex");
console.log("아래 한 줄을 .env 에 넣으세요:");
console.log(`ADMIN_PASSWORD_HASH=${salt}.${hash}`);
