# 삼익유공압(samickh) 인수인계 — 회사가 채울 값과 배포 전 할 일

작성 2026-07-19. 정답지(원문 클론): `C:\Users\kimok\Desktop\일정\samickh-clone` (사실대장.md·방향서.md 포함)

## 1. 회사가 채울 값 ([확인필요] — 원문 어디에도 없어 비워둔 사실)

| 무엇 | 채울 곳 | 채운 뒤 할 일 |
|---|---|---|
| 대표자명 | 관리자 → 사이트 문구(`/admin/site-content`) `ceo_name` | 자동 반영(푸터·정책) |
| 대표 이메일 | 〃 `email` (참고: 코머신 등록 hjson@samickh.co.kr — 회사 확인 필요) | 푸터·JSON-LD 자동 반영 |
| 사업자등록번호 | 〃 `biz_no` | 푸터·정책 자동 반영 |
| 개인정보 보호책임자 성명·직책 | 〃 `privacy_officer` | `/privacy` 자동 반영 |
| 개인정보처리방침 시행일 | 〃 `privacy_date` | `/privacy` 자동 반영 |
| 설립일(월일 — 원문은 연도 1998만) | 〃 (신규 키 추가 가능) | 필요 시 회사소개 문구 갱신 |
| **CAD 파일 5건 원본**(SS07A.zip·SS10A.zip·SS10A-L.zip·SS10A-M.zip·ss70h.zip) | 관리자 → 게시물 관리 → DWG/DWF 글의 "실파일 업로드" | 업로드 즉시 소실 뱃지 자동 해제. ※원본 서버·웨이백 모두 소실 확인됨(2026-07-19) |
| 고해상 실사(공장·제품) | 관리자 업로드 또는 개발자 전달 | 원본 사진은 전부 2008년 570px — 히어로/섹션 대체 권장 |
| 강력 대구경 공압 시리즈 정확 코드 | `/admin/series` (현재 원문 타이틀 표기 그대로 "SS 10A") | 카탈로그 확인 후 수정 |
| 직원수·매출 등 규모 지표 | 없으면 미게재 유지(날조 금지 원칙) | — |

## 2. `.env` (운영 배포 시)

| 키 | 현재(dev) | 운영에서 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | https://www.samickh.co.kr | 실배포 도메인 확정 시 확인 |
| `ADMIN_PASSWORD_HASH` | dev용 해시(비번 `samickh-dev-5700!`) | **반드시 교체** — `node scripts/admin-hash.mjs '<새 비번>'` |
| `ADMIN_SESSION_SECRET` | dev용 난수 | **반드시 교체** — `openssl rand -hex 32` |
| `TRUSTED_PROXY_HOPS` | 1 | 리버스 프록시 단수에 맞춤 |
| `SMTP_HOST/PORT/USER/PASS/FROM`·`INQUIRY_NOTIFY_TO` | 미설정(알림 무동작) | 문의 메일 알림 원하면 설정 |

## 3. 배포 전 체크리스트

- [ ] memory `deploy-preflight-reminder` 확인(사용자 지시 — 배포 얘기가 나오면 먼저 보고)
- [ ] `.env` 운영값 교체(위 표) 후 `pnpm build && pnpm start` 검증
- [ ] 정책 3종 noindex 해제 여부 결정(시행일·보호책임자 채운 뒤): `src/app/(site)/privacy·terms·email-policy/page.tsx`의 `noIndex: true` 제거
- [ ] 구글 서치콘솔·네이버 서치어드바이저 등록 + sitemap 제출(배포 후)
- [ ] CAD 5건 업로드(위 표) — DWG/DWF 자료실이 이 사이트의 핵심 자산
- [ ] 시드 재실행 금지: 운영 중 `pnpm db:seed`는 가드로 차단됨(`SEED_FORCE=1`은 원문 콘텐츠 리셋 — 운영 편집을 덮으니 사용 주의). SiteContent(문구)는 재시드에도 보존됨
- [ ] EN 번역 갱신 시: `prisma/translations.en.json` 수정 후 `SEED_FORCE=1 pnpm db:seed` — 단 게시글·제품을 관리자에서 수정했다면 재시드가 되돌리므로, 개별 수정은 관리자 화면에서

## 4. 운영 참고

- 관리자: `/admin` (12종 — 게시물·문의/CSV·사이트 문구 CMS·연혁·거래처·제품·계열·주문스펙(보어/장착)·FAQ·감사로그·방문분석·비번 해시 생성)
- 자유게시판·QNA: 원문이 외부 홍보글(PII)뿐이라 **이식하지 않음** — 게시판 틀은 DB에 없음(필요 시 신규 개발)
- FAQ: 원문에 없음 — 관리자에서 1건 이상 발행하면 공개 라우트/사이트맵에 자동 노출
- 원문 다운로드 수(카탈로그 20,246회 등)는 정답지 클론(`extract/seed-data.json`)에 보존 — 화면에는 미표시(현 카운트와 혼동 방지)
