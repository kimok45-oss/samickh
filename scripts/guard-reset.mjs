// scripts/guard-reset.mjs — db:reset 앞단 가드 (2026-07-25 신설, 32개 프로젝트 공통 구멍)
//
// 버그: seed.ts의 운영 가드(guardOperationalData)는 리셋을 못 막는다 —
// `prisma db push --force-reset`이 DB를 "먼저" 지우면 시드 시점엔 테이블이 비어
// 가드가 통과한다. 가드가 지뢰 뒤에 서 있던 셈. 이 스크립트는 지우기 "전"에
// 고객·런타임 데이터를 세어 리셋 자체를 차단한다.
//
// 배선: "db:reset": "node scripts/guard-reset.mjs && prisma db push --force-reset && pnpm db:seed"
// 통과: RESET_FORCE=1 — 단 이때도 var/backups/ 에 dev.db 자동 백업 후 진행.
//       (bash)  RESET_FORCE=1 pnpm db:reset
//       (PowerShell)  $env:RESET_FORCE="1"; pnpm db:reset
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const DB = "prisma/dev.db";
if (!existsSync(DB)) { console.log("guard-reset: DB 없음(최초 설치) — 통과"); process.exit(0); }

let Database;
try { Database = require("better-sqlite3"); }
catch { console.error("guard-reset: better-sqlite3 로드 실패 — 안전을 위해 차단(fail-closed). 리포 루트에서 실행했는지 확인."); process.exit(1); }

const db = new Database(DB, { readonly: true });
// 행 존재 자체가 "사람 활동의 증거"인 테이블만 보호(시드 3원칙 ②의 절대 보호 목록과 동일 결).
// 콘텐츠 테이블(제품·공지 시드분)은 여기서 안 센다 — 세면 리셋이 영원히 불가능해진다.
const PROTECT = /inquir|pageview|visit|audit|member|applic|subscriber|contactlog/i;
const hits = [];
for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%'").all()) {
  if (!PROTECT.test(name)) continue;
  try { const n = db.prepare(`SELECT COUNT(*) c FROM "${name}"`).get().c; if (n > 0) hits.push(`${name} ${n}행`); } catch {}
}
db.close();

if (!hits.length) { console.log("guard-reset: 고객·런타임 데이터 0 — 리셋 진행"); process.exit(0); }

if (process.env.RESET_FORCE === "1") {
  mkdirSync("var/backups", { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dest = `var/backups/dev-${ts}.db`;
  copyFileSync(DB, dest);
  console.warn(`guard-reset: RESET_FORCE=1 — [${hits.join(", ")}] 를 지웁니다. 백업: ${dest}`);
  process.exit(0);
}

console.error(`\n⛔ db:reset 차단 — 고객·런타임 데이터가 있습니다: ${hits.join(", ")}`);
console.error("   리셋하면 복구 불가입니다(시드는 원본 콘텐츠만 되살리고, 문의·방문기록·감사로그는 안 돌아옵니다).");
console.error('   정말 지우려면: RESET_FORCE=1 pnpm db:reset  (PowerShell: $env:RESET_FORCE="1"; pnpm db:reset)');
console.error("   — var/backups/ 에 자동 백업 후 진행됩니다.\n");
process.exit(1);
