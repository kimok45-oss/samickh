import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 설정. CLI(db push / migrate / seed)가 사용하는 스키마 위치와 데이터소스 URL을 지정합니다.
// 런타임 클라이언트(src/lib/db.ts)는 better-sqlite3 드라이버 어댑터로 같은 파일을 가리킵니다.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: "file:./prisma/dev.db",
  },
});
