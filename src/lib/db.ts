import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 + SQLite: better-sqlite3 드라이버 어댑터로 prisma/dev.db 파일에 연결합니다.
// 경로는 프로젝트 루트(cwd) 기준 — prisma.config.ts의 datasource.url과 동일한 파일을 가리킵니다.
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// dev에서 HMR마다 새 연결이 열리지 않도록 전역에 단일 클라이언트를 캐시합니다.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
