# samickh 구축 계약서 (에이전트 공용 — 반드시 준수)

## 프로젝트
- 삼익유공압주식회사(SAMICK H&P) 리뉴얼. dev 포트 **5700 고정**(변경 금지). 리포 C:\Github\samickh.
- 정답지(원문): `C:\Users\kimok\Desktop\일정\samickh-clone` — 사실대장.md·방향서.md·extract/seed-data.json 참조.
- 스택: Node24·Next16.2.9(App Router)·React19·TS·Prisma7+better-sqlite3·Tailwind v4·pnpm. DB 시드 완료(건드리지 말 것 — post21·product13·series10·history14·client20·boreRod13·mounting10·siteContent15·attachment19).
- **날조 절대 금지**: 회사 사실(연혁·인증·수치·이메일 등)을 지어내지 않는다. DB/사실대장에 없는 값은 빈칸+`[확인필요]`로 SiteContent에 존재. 인증서·특허·수상 등 원문에 없는 섹션 만들지 말 것.

## 디자인 방향(확정 — 방향서.md)
- 개념 "실린더는 형번으로 주문된다". 머신 다크 연속면(#141619, 교차 밴드 0). 
- 토큰: globals.css @theme 확정 — `bg-bg, bg-bg-raised, bg-bg-panel, border-line, text-ink, text-ink-dim, text-ink-faint, text-red, text-red-live(그래픽 전용), bg-red, --font-mono`. **임의 색 추가 금지. 레드를 본문 텍스트에 쓰지 말 것(그래픽·핸들·CTA 배경 전용).**
- 헤드라인: `font-mono`(IBM Plex Mono — 형번·치수·영문), 한글 본문 Pretendard. 
- 금지: 무한 이동 라인 애니메이션, 커스텀 커서, 카운트업 스탯 밴드, 인트로 스플래시, 중앙정렬 히어로 클리셰, `01/02` 넘버링 eyebrow 모티프, 채도색 소형 텍스트(대비 4.5:1 미달), 누런 계열.
- 모션: motion-kit subtle(src/components/motion — 이미 복사됨). reduced-motion 가드 필수.

## 공유 계약(이미 존재 — 수정 금지, import만)
- `@/lib/db` → `prisma` (better-sqlite3 어댑터)
- `@/lib/lang` → `getLang(): Promise<"ko"|"en">` (쿠키)
- `@/lib/content` → `getContent/getContents/getContentGroup` (SiteContent — 공개면 문구는 반드시 이걸로)
- `@/lib/date` → `fmtDate/fmtDateTime/toKstInputValue` (KST 단일 경로 — toISOString 직접 표시 금지)
- `src/app/layout.tsx`·`globals.css` @theme — **A는 수정 금지**(B만 globals 하단 컴포넌트 CSS 추가 가능)
- Prisma 스키마 변경 금지(필요하면 보고만)

## 콘텐츠 단일 소유권 (공개면=DB. src/data 상수 직접 import 금지)
| 콘텐츠 | 모델 | 공개 렌더 | 어드민 |
|---|---|---|---|
| 공지(3)/업계뉴스(6) | Post board=notice/news | /news/notice, /news/industry (+/[slug]) | /admin/posts |
| 유공압자료(7)/CAD(3)/제품정보(2) | Post board=tech/cad/pinfo | /support/resources, /support/cad, /support/product-info (+/[slug]) | /admin/posts |
| 제품 13 | Product cat1/2/3 | /products (필터+아코디언) | /admin/products |
| 계열 10 | Series | /business, /business/[slug] | /admin/series |
| 연혁 14 | History | /company/history | /admin/history |
| 거래처 20 | Client 4그룹 | /company/clients | /admin/clients |
| 보어13/장착10 | BoreRod·Mounting | 홈 히어로, /products/order-guide | /admin/order-specs |
| 인사말·조직·연락처·슬로건 | SiteContent | /company/greeting·organization·location, 푸터 | /admin/site-content |
| FAQ(0건) | Faq | /support/faq — **0건이면 GNB·푸터·sitemap 전부 숨김** | /admin/faqs |
| 문의/견적 | Inquiry | /support/inquiry, /support/quote | /admin/inquiries |
- 자유게시판(free)·QNA(qna): **이식 안 함**(원문 전건 외부업체 홍보+PII). 모델 board 값만 존재. 공개 라우트 만들지 않는다. 관리자에서 board 선택지에 넣지 않아도 됨.

## 라우트 규약
- 공개 페이지는 `src/app/(site)/` 그룹 아래(B가 (site)/layout.tsx에 Header/Footer). 관리자는 `src/app/admin/`.
- **루트/그룹 루트 loading.tsx 금지**(소프트404 원인). 숫자 id 파라미터는 `Number.isInteger` 가드. slug 미존재 → `notFound()`.
- canonical: 페이지별 self(`alternates.canonical`) — 루트 layout에 canonical 금지.
- 안정 키: Post.slug(`notice-2`), Product.slug, Series.slug — 자동증가 id 링크 금지.
- 첨부: 게시판 공개자료는 `/uploads/attach/...`(public, 이미 복사됨) 직링크. `Attachment.missing=true`(CAD zip 5건)는 다운로드 링크 대신 "원본 파일 소실 — 재업로드 예정" 뱃지(ko)/"File pending re-upload"(en). Attachment에 sizeLabel 없음 — DB의 size=0이면 크기 표시 생략.
- 원본 다운로드 실측치(카탈로그 2만+ 다운로드)는 seed-data.json posts[].attachments[].downCount 참조 — 상세페이지 "원본 누적 다운로드 N회" 라벨은 넣지 않는다(현 사이트 카운트와 혼동). 조회수(hits)는 원본 값 이식됨 + 신규 증가 경로 필수.

## 보안(전 항목 필수)
- 관리자: scrypt 해시(`ADMIN_PASSWORD_HASH` env, **hex 포맷 `salt.hash` — `$` 문자 금지**), 세션 = HMAC 서명 토큰(`ADMIN_SESSION_SECRET`, 만료 12h, fail-closed — env 미설정 시 로그인 불가). `|| "기본값"` 폴백 절대 금지.
- **모든 변형 서버 액션 첫 줄 `await requireAdmin()`**(login/logout·공개 문의 제출 제외). **모든 /admin 조회 페이지 첫 줄 `await guardAdminPage()`**(미인증 redirect — RSC 직렬화 유출 방지).
- 업로드(관리자 첨부·견적 파일): 확장자 화이트리스트(pdf,zip,jpg,jpeg,png,gif,dwg,dwf)+매직바이트 검증+실행형 차단+난수 파일명+bodySizeLimit. **견적요청 첨부는 public 밖 `var/uploads/`** + 관리자 인증 다운로드 라우트(PII 가능). 관리자 게시판 첨부는 public/uploads/attach.
- 문의/견적: rate-limit(IP, TRUSTED_PROXY_HOPS 방식)+허니팟+DOMPurify 정화. CSV 내보내기: UTF-8 BOM+수식 인젝션 방어(`=+-@` 선두 `'`).
- CSP/보안헤더는 next.config.ts에 이미 있음(수정 금지).

## i18n(한/영)
- 쿠키 `lang` + getLang. 첫 방문 자동감지: proxy(미들웨어)에서 Accept-Language **q값 순위 파싱**(`includes(",en")` 부분매칭 금지 — ko,en 병기 크롬에서 en 오출력 버그). DB는 *En 컬럼(현재 null — 폴백은 ko 표시, 번역은 후속 단계).
- `<html lang>`은 layout에서 처리됨. 페이지 정적 문구는 페이지 모듈 스코프 `{ko,en}` 사전. 비가시 속성(alt·aria-label·placeholder)도 lang 따라감.

## SEO/공개면 셸 8종(필수)
`app/not-found.tsx`(브랜드·언어 대응) · `error.tsx`+`global-error.tsx` · OG 이미지(정적 1200×630, 실측 사실만) · canonical 전 페이지 self · 정책 3종(privacy/terms/email-policy) noindex+robots 제외 · `sitemap.ts`+`robots.ts`+JSON-LD(Organization — 원문 사실만: 주소·전화. 이메일 없음) · 조회수 실제 증가 경로(상세 렌더 시 비콘/서버 증가 — 쿠키 디듀프) · `metadataBase = NEXT_PUBLIC_SITE_URL env`(하드코딩 금지).
정책 페이지 본문: 개인정보처리방침은 표준 조문 틀 + 보호책임자/시행일은 `getContent("privacy_officer"/"privacy_date")` — 빈 값이면 "[회사 확인 후 기재]" 표시.

## 검증
- 작업 후 `pnpm typecheck` 통과 확인(tsgo). dev 서버는 띄우지 말 것(포트 5700은 오케스트레이터가 관리). **커밋 금지.**
