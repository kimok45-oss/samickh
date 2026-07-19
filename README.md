# 삼익유공압주식회사 (SAMICK H&P) — 홈페이지 리뉴얼

유압·공압 실린더 제조 전문기업 삼익유공압주식회사(1998년 분사, 대구 달성)의 공식 홈페이지 리뉴얼 프로젝트입니다.
공개 사이트와, 콘텐츠·문의·방문 통계를 운영하는 관리자 콘솔을 포함합니다. **한국어 / 영어**.

`Next.js 16` · `React 19` · `TypeScript 7` · `Prisma 7` · `Tailwind CSS v4` · `pnpm 10`

---

## 🧱 기술 스택

| 영역 | 사용 |
|---|---|
| 런타임 | Node.js 24 LTS |
| 프레임워크 | Next.js 16.2.9 (App Router · Turbopack) · React 19.2.4 |
| 언어 | TypeScript 7 (`@typescript/native-preview` / `tsgo`) |
| 데이터 | Prisma 7 + better-sqlite3 (드라이버 어댑터) |
| 스타일 | Tailwind CSS v4 (`@theme` 토큰) · Pretendard |
| 모션·차트 | motion · lenis · recharts |
| 보안 | isomorphic-dompurify (게시판 HTML 새니타이즈) |
| 패키지 매니저 | pnpm 10 |

## ✨ 주요 기능

**공개 사이트** (한국어 / 영어)
- 홈 = **실린더 주문방법 스테이션**(원본 카탈로그 p.11 복원) — 시리즈·보어 13단·롯드계열·지지부형식 10코드·스트로크 드래그 → 이론 출력(F=P×A)·형번 실시간 생성, 견적요청 프리필 연결
- 회사소개: 인사말 · 회사연혁(14건) · 주요거래업체(20사) · 조직현황 · 찾아오시는길(네이버/카카오 길찾기)
- 사업분야: 실린더 10계열(`/business`, `/business/[slug]`) — 원문 스펙표·특수사양·도면 자산
- 제품소개: 치수표 13건 카탈로그(`/products`) + 실린더 주문방법 도해(`/products/order-guide`)
- 고객지원: 유공압자료(7) · DWG/DWF DATA(3) · PRODUCT INFORMATION(2) · 온라인문의 · 견적요청(파일 첨부)
- 커뮤니티: 공지사항(3) · 업계관련뉴스(6)
- 정책: 개인정보처리방침 · 이용약관 · 이메일무단수집거부 (noindex)
- SEO: canonical self · sitemap/robots · JSON-LD(Organization·WebSite) · OG 이미지 · HTML 사이트맵(`/sitemap-page`)

**관리자 콘솔** (`/admin`)
- scrypt 해시 인증 + 만료 서명 토큰 + rate-limit (fail-closed)
- 게시물·문의 CRUD · 자체 방문 분석 대시보드(GA 없이 PII-free, recharts)

## 🚀 빠른 시작

전제: **Node.js 24**, **pnpm 10**.

```bash
pnpm install                  # 의존성 설치 (postinstall 에서 prisma generate)
cp .env.example .env          # 환경변수 — 아래 값 채우기
pnpm db:push                  # SQLite 스키마 반영 (prisma/dev.db)
pnpm db:seed                  # 실데이터 시드
pnpm dev                      # http://localhost:5700
```

## 🔑 환경변수 (`.env`)

> `.env` 와 로컬 DB는 `.gitignore` 대상 — 커밋하지 마세요.

```ini
NEXT_PUBLIC_SITE_URL=https://www.samickh.co.kr
ADMIN_PASSWORD_HASH=      # node scripts/admin-hash.mjs '<비밀번호>' 로 생성 (scrypt "saltHex.hashHex")
ADMIN_SESSION_SECRET=     # openssl rand -hex 32
```

## 📜 스크립트

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 (포트 5700) |
| `pnpm build` / `pnpm start` | 프로덕션 빌드 / 서버 (포트 5700) |
| `pnpm typecheck` | `tsgo --noEmit` 타입 체크 |
| `pnpm db:push` / `db:seed` / `db:reset` | 스키마 반영 / 시드 / 초기화 후 재시드 |

## 📁 프로젝트 구조 (요약)

```
src/
  app/            라우트 — 공개 / admin / api
  components/     UI · 모션(SmoothScroll · Reveal 등)
  lib/            auth(scrypt) · db · i18n · seo · analytics
prisma/           schema · seed (정답지 기반 실데이터)
public/           로고 · 이미지
```

---

원본 콘텐츠 © 삼익유공압주식회사(SAMICK H&P). 본 저장소는 홈페이지 리뉴얼 작업물입니다.
